import { getSession } from "@/lib/auth-server";
import {
  deleteSession,
  endSession,
  updateSession,
} from "@/lib/queries/sessions";

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
  if ("endedAt" in body) {
    await endSession(id, { endedAt: body.endedAt, duration: body.duration });
  } else {
    await updateSession(id, {
      categoryId: body.categoryId,
      duration: body.duration,
      mode: body.mode,
    });
  }
  return Response.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session?.user) return unauthorized();

  const { id } = await params;
  await deleteSession(id);
  return Response.json({ success: true });
}
