import { getSession } from "@/lib/auth-server";
import { seedDefaultCategories } from "@/lib/queries/categories";

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * One-shot, idempotent seeding of the starter categories.
 * Replaces the old client-side loop that fired one POST per default
 * (and could fan out into duplicates when the seeding effect re-ran
 * before the first batch resolved).
 */
export async function POST() {
  const session = await getSession();
  if (!session?.user) return unauthorized();

  const seeded = await seedDefaultCategories(session.user.id);
  return Response.json({ seeded });
}
