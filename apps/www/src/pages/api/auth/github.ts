import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  const GITHUB_CLIENT_ID = import.meta.env.GITHUB_CLIENT_ID;

  if (!GITHUB_CLIENT_ID) {
    return new Response("Missing GitHub Client ID", { status: 500 });
  }

  const redirectUri = "http://localhost:4321/api/auth/callback";

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
    },
  });
};