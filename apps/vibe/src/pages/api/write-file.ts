import type { APIRoute } from "astro";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json()) as {
    projectPath?: string;
    filePath?: string;
    content?: string;
  };

  const { projectPath, filePath, content } = body;

  if (!projectPath || !filePath || content === undefined) {
    return new Response("Missing projectPath, filePath, or content", {
      status: 400,
    });
  }

  // Prevent path traversal
  const resolved = resolve(projectPath, filePath);
  if (!resolved.startsWith(resolve(projectPath))) {
    return new Response("Invalid file path", { status: 403 });
  }

  try {
    await mkdir(dirname(resolved), { recursive: true });
    await writeFile(resolved, content, "utf-8");
    return new Response(JSON.stringify({ ok: true, path: resolved }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(`Write failed: ${err?.message}`, { status: 500 });
  }
};
