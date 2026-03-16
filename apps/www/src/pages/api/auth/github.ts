import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {

  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return new Response("Missing GitHub Client ID", { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "read:user user:email",
  });

  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
    302
  );
};