// Skeleton boundary for the database package.
// Real schema + client move here in a later slice; this stub keeps
// `turbo build` ordering (apps/api depends on @repo/db) verifiable now.

export const DB_PACKAGE = "@repo/db";

export function placeholder(): string {
  return DB_PACKAGE;
}
