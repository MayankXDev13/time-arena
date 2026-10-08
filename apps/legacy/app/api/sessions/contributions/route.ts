import { getSession } from "@/lib/auth-server";
import { getContributionGraph } from "@/lib/queries/sessions";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  return Response.json(
    await getContributionGraph(
      session.user.id,
      year ? Number(year) : undefined,
    ),
  );
}
