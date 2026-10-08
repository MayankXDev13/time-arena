import { getSession } from "@/lib/auth-server";
import { createSession, getSessionHistory } from "@/lib/queries/sessions";

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 20);
  const result = await getSessionHistory({
    userId: session.user.id,
    limit,
    cursor: searchParams.get("cursor") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    mode: (searchParams.get("mode") as "work" | "break" | null) ?? undefined,
    startDate: searchParams.get("startDate")
      ? Number(searchParams.get("startDate"))
      : undefined,
    endDate: searchParams.get("endDate")
      ? Number(searchParams.get("endDate"))
      : undefined,
  });
  return Response.json(result);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) return unauthorized();

  const body = await request.json();
  const id = await createSession({
    userId: session.user.id,
    categoryId: body.categoryId ?? null,
    start: body.start,
    duration: body.duration ?? 0,
    mode: body.mode,
  });
  return Response.json({ id });
}
