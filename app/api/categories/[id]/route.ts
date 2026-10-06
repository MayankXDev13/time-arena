import { getSession } from "@/lib/auth-server";
import { deleteCategory, updateCategory } from "@/lib/queries/categories";

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.user) return unauthorized();

  const { id } = await params;
  const body = await request.json();
  await updateCategory(id, { name: body.name, color: body.color });
  return Response.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.user) return unauthorized();

  const { id } = await params;
  await deleteCategory(id);
  return Response.json({ success: true });
}
