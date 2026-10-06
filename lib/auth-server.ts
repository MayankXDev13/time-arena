import { headers } from "next/headers";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const handler = toNextJsHandler(auth);

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}
