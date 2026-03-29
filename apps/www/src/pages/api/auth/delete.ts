import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  const headers = new Headers();

  // Expirar la cookie
  headers.append(
    "Set-Cookie",
    "stealthis_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;"
  );
  headers.append("Location", "/");

  return new Response(null, { status: 302, headers });
};
