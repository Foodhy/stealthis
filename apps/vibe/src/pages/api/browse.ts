import type { APIRoute } from "astro";
import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { homedir } from "node:os";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const raw = url.searchParams.get("path") || homedir();
  const dir = resolve(raw);

  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const dirs = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b));

    return new Response(JSON.stringify({ path: dir, dirs }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ path: dir, dirs: [], error: err?.message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};
