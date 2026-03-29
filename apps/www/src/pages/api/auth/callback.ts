import type { APIRoute } from "astro";

export const prerender = false;
const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = (import.meta as any).env ?? {};

// Muy simple: en un proyecto real usarías una librería de cookies más robusta
function createSessionCookie(payload: unknown) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const maxAge = 60 * 60 * 24 * 7; // 7 días
  return `stealthis_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge};`;
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code || !GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    const debug = {
      requestUrl: request.url,
      searchParams: Object.fromEntries(url.searchParams.entries()),
      codePresent: !!code,
      clientIdPresent: !!GITHUB_CLIENT_ID,
      clientSecretPresent: !!GITHUB_CLIENT_SECRET,
    };
    return new Response(JSON.stringify({ error: "Missing OAuth params", debug }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1) Intercambiar code -> access_token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return new Response("Failed to exchange code", { status: 500 });
  }

  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenJson.access_token;

  if (!accessToken) {
    return new Response("Missing access token", { status: 500 });
  }

  // 2) Obtener perfil de usuario
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "stealthis.dev",
    },
  });

  if (!userRes.ok) {
    return new Response("Failed to fetch GitHub user", { status: 500 });
  }

  const userJson = (await userRes.json()) as {
    id: number;
    login: string;
    name?: string;
    avatar_url?: string;
  };

  // 2.1) Obtener email (opcional). Este endpoint es necesario
  // cuando GitHub no devuelve email en `/user`.
  let email: string | null = null;
  try {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "stealthis.dev",
      },
    });

    if (emailsRes.ok) {
      const emailsJson = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;

      const primaryVerified = emailsJson.find((e) => e.primary && e.verified);
      const primary = emailsJson.find((e) => e.primary);
      const fallback = emailsJson[0];
      email = (primaryVerified ?? primary ?? fallback)?.email ?? null;
    }
  } catch {
    // Si falla la carga de email, igual dejamos login/profile.
    email = null;
  }

  const session = {
    id: userJson.id,
    login: userJson.login,
    name: userJson.name ?? userJson.login,
    avatarUrl: userJson.avatar_url ?? null,
    email,
    bio: "",
  };

  const headers = new Headers();
  headers.append("Set-Cookie", createSessionCookie(session));

  // Redirige a home (puedes cambiarlo a /dashboard si luego creas esa página)
  headers.append("Location", "/");
  return new Response(null, { status: 302, headers });
};