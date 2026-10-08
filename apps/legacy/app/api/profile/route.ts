import { getSession } from "@/lib/auth-server";
import { getProfile, updateProfile } from "@/lib/queries/users";

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getSession();
  if (!session?.user) return unauthorized();

  return Response.json(await getProfile(session.user.id));
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session?.user) return unauthorized();

  await updateProfile(session.user.id, await request.json());
  return Response.json({ success: true });
}
