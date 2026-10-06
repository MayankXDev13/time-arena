import { getSession } from "@/lib/auth-server";
import { createCategory, listCategories } from "@/lib/queries/categories";

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getSession();
  if (!session?.user) return unauthorized();

  return Response.json(await listCategories(session.user.id));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) return unauthorized();

  const body = await request.json();
  const id = await createCategory({
    userId: session.user.id,
    name: body.name,
    color: body.color,
  });
  return Response.json({ id });
}
