import { and, count, desc, eq, gte, lt, lte, or } from "drizzle-orm";
import { db, sessions } from "@repo/db";

export type SessionMode = "work" | "break";

export interface SessionRow {
  id: string;
  userId: string;
  categoryId: string | null;
  start: number;
  endedAt: number | null;
  duration: number;
  mode: SessionMode;
}

function toRow(s: typeof sessions.$inferSelect): SessionRow {
  return {
    id: s.id,
    userId: s.userId,
    categoryId: s.categoryId,
    start: s.start,
    endedAt: s.endedAt,
    duration: s.duration,
    mode: s.mode as SessionMode,
  };
}

export async function createSession(input: {
  userId: string;
  categoryId?: string | null;
  start: number;
  duration: number;
  mode: SessionMode;
}): Promise<string> {
  const [row] = await db
    .insert(sessions)
    .values({
      userId: input.userId,
      categoryId: input.categoryId ?? null,
      start: input.start,
      duration: input.duration,
      mode: input.mode,
    })
    .returning({ id: sessions.id });
  return row.id;
}

export interface HistoryArgs {
  userId: string;
  limit: number;
  cursor?: string;
  categoryId?: string;
  mode?: SessionMode;
  startDate?: number;
  endDate?: number;
}

function parseCursor(cursor: string): { start: number; id: string } | null {
  const sep = cursor.lastIndexOf("_");
  if (sep < 0) return null;
  const start = Number(cursor.slice(0, sep));
  if (!Number.isFinite(start)) return null;
  return { start, id: cursor.slice(sep + 1) };
}

export async function getSessionHistory(args: HistoryArgs): Promise<{
  page: SessionRow[];
  nextCursor?: string;
  hasMore: boolean;
  totalPages: number;
  totalCount: number;
}> {
  const filters = [eq(sessions.userId, args.userId)];
  if (args.categoryId) filters.push(eq(sessions.categoryId, args.categoryId));
  if (args.mode) filters.push(eq(sessions.mode, args.mode));
  if (args.startDate !== undefined)
    filters.push(gte(sessions.start, args.startDate));
  if (args.endDate !== undefined) filters.push(lte(sessions.start, args.endDate));

  const parsed = args.cursor ? parseCursor(args.cursor) : null;
  const pageFilters = parsed
    ? [
        ...filters,
        or(
          lt(sessions.start, parsed.start),
          and(eq(sessions.start, parsed.start), lt(sessions.id, parsed.id)),
        )!,
      ]
    : filters;

  const rows = await db
    .select()
    .from(sessions)
    .where(and(...pageFilters))
    .orderBy(desc(sessions.start), desc(sessions.id))
    .limit(args.limit + 1);

  const hasMore = rows.length > args.limit;
  const pageRows = hasMore ? rows.slice(0, args.limit) : rows;
  const last = pageRows[pageRows.length - 1];
  const nextCursor = hasMore && last ? `${last.start}_${last.id}` : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(sessions)
    .where(and(...filters));

  return {
    page: pageRows.map(toRow),
    nextCursor,
    hasMore,
    totalPages: Math.ceil(total / args.limit),
    totalCount: total,
  };
}

function ownerScope(id: string, userId: string) {
  return and(eq(sessions.id, id), eq(sessions.userId, userId));
}

/** Returns false when the row is missing or owned by someone else. */
export async function updateSession(
  id: string,
  userId: string,
  input: {
    categoryId?: string | null;
    duration?: number;
    mode?: SessionMode;
  },
): Promise<boolean> {
  const patch: Partial<typeof sessions.$inferInsert> = {};
  if (input.categoryId !== undefined) patch.categoryId = input.categoryId;
  if (input.duration !== undefined) patch.duration = input.duration;
  if (input.mode !== undefined) patch.mode = input.mode;
  if (Object.keys(patch).length === 0) {
    const existing = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(ownerScope(id, userId))
      .limit(1);
    return existing.length > 0;
  }
  const rows = await db
    .update(sessions)
    .set(patch)
    .where(ownerScope(id, userId))
    .returning({ id: sessions.id });
  return rows.length > 0;
}

/** Returns false when the row is missing or owned by someone else. */
export async function endSession(
  id: string,
  userId: string,
  input: { endedAt: number; duration: number },
): Promise<boolean> {
  const rows = await db
    .update(sessions)
    .set({ endedAt: input.endedAt, duration: input.duration })
    .where(ownerScope(id, userId))
    .returning({ id: sessions.id });
  return rows.length > 0;
}

/** Returns false when the row is missing or owned by someone else. */
export async function deleteSession(id: string, userId: string): Promise<boolean> {
  const rows = await db
    .delete(sessions)
    .where(ownerScope(id, userId))
    .returning({ id: sessions.id });
  return rows.length > 0;
}

export async function getRecentSessions(
  userId: string,
  limit: number,
  categoryId?: string,
): Promise<SessionRow[]> {
  const { page } = await getSessionHistory({ userId, limit, categoryId });
  return page;
}
