import type { APIRoute } from "astro";

export const prerender = false;

function parseSessionCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(";").find((part) => part.trim().startsWith("stealthis_session="));
  if (!match) return null;

  const value = match.trim().slice("stealthis_session=".length);
  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const GET: APIRoute = async ({ request }) => {
  const cookie = request.headers.get("cookie");
  const session = parseSessionCookie(cookie);

  if (!session) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      authenticated: true,
      user: session,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};