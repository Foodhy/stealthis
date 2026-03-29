import type { APIRoute } from "astro";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

export const prerender = false;

// ─── Constants ──────────────────────────────────────────────────────────────

const OPENAI_TOKEN_URL = "https://auth.openai.com/oauth/token";
const CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";

// Storage
const VIBE_DIR = path.join(homedir(), ".vibe");
const OAUTH_FILE = path.join(VIBE_DIR, "openai-oauth.json");

// Codex CLI auth file
const CODEX_AUTH = path.join(homedir(), ".codex", "auth.json");

// ─── Types ──────────────────────────────────────────────────────────────────

type StoredTokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix ms
  email?: string;
  account_id?: string;
};

type CodexAuth = {
  auth_mode?: string;
  tokens?: {
    access_token: string;
    refresh_token: string;
    id_token?: string;
    account_id?: string;
  };
};

// ─── JWT decode (no validation, just payload) ───────────────────────────────

function decodeJwtPayload(token: string): Record<string, any> {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
  } catch {
    return {};
  }
}

// ─── Token storage ──────────────────────────────────────────────────────────

async function loadTokens(): Promise<StoredTokens | null> {
  try {
    const raw = await readFile(OAUTH_FILE, "utf-8");
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

async function saveTokens(tokens: StoredTokens) {
  await mkdir(VIBE_DIR, { recursive: true });
  await writeFile(OAUTH_FILE, JSON.stringify(tokens, null, 2));
}

async function clearTokens() {
  try {
    const { unlink } = await import("node:fs/promises");
    await unlink(OAUTH_FILE);
  } catch {}
}

// ─── Read Codex CLI tokens ──────────────────────────────────────────────────

async function readCodexTokens(): Promise<StoredTokens | null> {
  try {
    const raw = await readFile(CODEX_AUTH, "utf-8");
    const data = JSON.parse(raw) as CodexAuth;

    if (data.auth_mode !== "chatgpt" || !data.tokens?.access_token) return null;

    const accessPayload = decodeJwtPayload(data.tokens.access_token);
    const idPayload = data.tokens.id_token ? decodeJwtPayload(data.tokens.id_token) : {};

    return {
      access_token: data.tokens.access_token,
      refresh_token: data.tokens.refresh_token,
      expires_at: (accessPayload.exp ?? Math.floor(Date.now() / 1000) + 3600) * 1000,
      email: idPayload.email,
      account_id:
        data.tokens.account_id ?? accessPayload["https://api.openai.com/auth"]?.chatgpt_account_id,
    };
  } catch {
    return null;
  }
}

// ─── Token refresh ──────────────────────────────────────────────────────────

async function refreshAccessToken(refreshToken: string): Promise<StoredTokens | null> {
  const res = await fetch(OPENAI_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    expires_in?: number;
  };

  const idPayload = data.id_token ? decodeJwtPayload(data.id_token) : {};
  const accessPayload = decodeJwtPayload(data.access_token);

  const tokens: StoredTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at: Date.now() + (data.expires_in ?? 3600) * 1000,
    email: idPayload.email,
    account_id: accessPayload["https://api.openai.com/auth"]?.chatgpt_account_id,
  };

  await saveTokens(tokens);
  return tokens;
}

// ─── Resolve tokens: Vibe store → Codex CLI → null ──────────────────────────

async function resolveTokens(): Promise<StoredTokens | null> {
  // 1. Try Vibe's own store
  const vibe = await loadTokens();
  if (vibe) return vibe;

  // 2. Try Codex CLI
  const codex = await readCodexTokens();
  if (codex) {
    await saveTokens(codex); // cache locally
    return codex;
  }

  return null;
}

// ─── POST handler ───────────────────────────────────────────────────────────

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json()) as { action: string };

  switch (body.action) {
    case "status": {
      const tokens = await resolveTokens();
      if (!tokens) {
        // Check if Codex CLI exists at all
        let hasCodexCli = false;
        try {
          await readFile(CODEX_AUTH, "utf-8");
          hasCodexCli = true;
        } catch {}

        return json({ loggedIn: false, hasCodexCli });
      }

      const expired = tokens.expires_at < Date.now();
      return json({
        loggedIn: true,
        email: tokens.email,
        accountId: tokens.account_id,
        expired,
        expiresAt: tokens.expires_at,
      });
    }

    case "token": {
      let tokens = await resolveTokens();
      if (!tokens) return json({ error: "Not logged in" }, 401);

      // Auto-refresh if expired or expiring within 60s
      if (tokens.expires_at < Date.now() + 60_000) {
        const refreshed = await refreshAccessToken(tokens.refresh_token);
        if (!refreshed) {
          // Try re-reading from Codex CLI (user may have re-authenticated)
          const codex = await readCodexTokens();
          if (codex && codex.expires_at > Date.now()) {
            await saveTokens(codex);
            tokens = codex;
          } else {
            return json({ error: "Token expired. Run 'codex' to re-authenticate." }, 401);
          }
        } else {
          tokens = refreshed;
        }
      }

      return json({ access_token: tokens.access_token, expires_at: tokens.expires_at });
    }

    case "refresh": {
      const tokens = await resolveTokens();
      if (!tokens) return json({ error: "Not logged in" }, 401);

      const refreshed = await refreshAccessToken(tokens.refresh_token);
      if (!refreshed) return json({ error: "Refresh failed" }, 500);

      return json({
        loggedIn: true,
        email: refreshed.email,
        expiresAt: refreshed.expires_at,
      });
    }

    case "sync-codex": {
      const codex = await readCodexTokens();
      if (!codex) return json({ error: "No Codex CLI tokens found. Run 'codex' first." }, 404);
      await saveTokens(codex);
      return json({
        loggedIn: true,
        email: codex.email,
        accountId: codex.account_id,
        expired: codex.expires_at < Date.now(),
      });
    }

    case "logout": {
      await clearTokens();
      return json({ ok: true });
    }

    default:
      return json({ error: "Unknown action" }, 400);
  }
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
