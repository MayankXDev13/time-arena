import { httpRouter, httpActionGeneric } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

const getUploadUrlAction = httpActionGeneric(async (ctx, request) => {
  const uploadUrl = await ctx.storage.generateUploadUrl();
  return new Response(JSON.stringify({ uploadUrl }), {
    headers: { "Content-Type": "application/json" },
  });
});

http.route({
  path: "/getUploadUrl",
  method: "POST",
  handler: getUploadUrlAction,
});

export default http;