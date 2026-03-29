import type { APIRoute } from "astro";

export const prerender = false;

function parseSessionCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .find((part) => part.trim().startsWith("stealthis_session="));
  if (!match) return null;

  const value = match.trim().slice("stealthis_session=".length);
  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function createSessionCookie(payload: unknown) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const maxAge = 60 * 60 * 24 * 7; // 7 días
  return `stealthis_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge};`;
}

export const POST: APIRoute = async ({ request }) => {
  const cookie = request.headers.get("cookie");
  const session = parseSessionCookie(cookie);

  if (!session) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = (await request.json().catch(() => null)) as
    | { displayName?: unknown; bio?: unknown }
    | null;

  if (!body) {
    return new Response(JSON.stringify({ error: "Missing body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : "";
  const bio = typeof body.bio === "string" ? body.bio.slice(0, 500) : "";

  const nextSession = {
    ...session,
    name: displayName || session.login,
    bio,
  };

  const headers = new Headers();
  headers.append("Set-Cookie", createSessionCookie(nextSession));

  return new Response(
    JSON.stringify({
      ok: true,
      user: nextSession,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
