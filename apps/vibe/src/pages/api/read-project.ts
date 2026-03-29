import type { APIRoute } from "astro";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

export const prerender = false;

type FileEntry = { path: string; content: string };

const IGNORED = new Set([
  "node_modules",
  ".git",
  ".next",
  ".astro",
  "dist",
  "build",
  ".cache",
  ".DS_Store",
  "Thumbs.db",
  ".env",
  ".env.local",
]);

const MAX_FILE_SIZE = 512 * 1024; // 512 KB
const MAX_FILES = 500;

async function walkDir(
  dir: string,
  rootDir: string,
  files: FileEntry[],
): Promise<void> {
  if (files.length >= MAX_FILES) return;

  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (files.length >= MAX_FILES) break;
    if (IGNORED.has(entry.name)) continue;

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await walkDir(fullPath, rootDir, files);
    } else if (entry.isFile()) {
      try {
        const info = await stat(fullPath);
        if (info.size > MAX_FILE_SIZE) continue;

        // Skip binary files by checking extension
        const ext = entry.name.split(".").pop()?.toLowerCase() ?? "";
        const binaryExts = new Set([
          "png", "jpg", "jpeg", "gif", "webp", "ico", "bmp", "svg",
          "woff", "woff2", "ttf", "eot", "otf",
          "zip", "tar", "gz", "bz2", "7z", "rar",
          "mp3", "mp4", "wav", "avi", "mov", "mkv",
          "pdf", "doc", "docx", "xls", "xlsx",
          "exe", "dll", "so", "dylib", "o", "a",
          "lock",
        ]);
        if (binaryExts.has(ext)) continue;

        const content = await readFile(fullPath, "utf-8");
        const relPath = relative(rootDir, fullPath);
        files.push({ path: relPath, content });
      } catch {
        // Skip files we can't read
      }
    }
  }
}

export const GET: APIRoute = async ({ url }) => {
  const projectPath = url.searchParams.get("path");

  if (!projectPath) {
    return new Response("Missing path parameter", { status: 400 });
  }

  try {
    const files: FileEntry[] = [];
    await walkDir(projectPath, projectPath, files);

    return new Response(JSON.stringify({ files }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ files: [], error: err?.message }),
      { headers: { "Content-Type": "application/json" } },
    );
  }
};
