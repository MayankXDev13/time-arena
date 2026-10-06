import { getSession } from "@/lib/auth-server";
import { getRecentSessions } from "@/lib/queries/sessions";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  return Response.json(
    await getRecentSessions(
      session.user.id,
      Number(searchParams.get("limit") ?? 20),
      searchParams.get("categoryId") ?? undefined,
    ),
  );
}
