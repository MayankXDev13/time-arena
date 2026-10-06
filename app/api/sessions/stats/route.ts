import { getSession } from "@/lib/auth-server";
import { getStats } from "@/lib/queries/sessions";

export async function GET() {
  const session = await getSession();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  return Response.json(await getStats(session.user.id));
}
