import type { APIRoute } from "astro";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

export const prerender = false;

const PROJECTS_DIR = join(homedir(), ".vibe", "projects");

type SavedProject = {
  id: string;
  name: string;
  description: string;
  stack: string;
  projectPath: string;
  provider: string;
  selectedModel: string;
  createdAt: string;
  updatedAt: string;
};

type SavedChat = {
  messages: { id: string; role: string; content: string }[];
};

function projectDir(id: string) {
  return join(PROJECTS_DIR, id);
}

function projectFile(id: string) {
  return join(projectDir(id), "project.json");
}

function chatFile(id: string) {
  return join(projectDir(id), "chat.json");
}

/** GET /api/projects — list all projects */
/** GET /api/projects?id=xxx — get single project + chat */
/** POST /api/projects — create or update a project */
/** POST /api/projects?action=chat&id=xxx — save chat messages */

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id");

  if (id) {
    // Return single project + chat
    try {
      const projRaw = await readFile(projectFile(id), "utf-8");
      const project = JSON.parse(projRaw) as SavedProject;
      let messages: SavedChat["messages"] = [];
      try {
        const chatRaw = await readFile(chatFile(id), "utf-8");
        messages = (JSON.parse(chatRaw) as SavedChat).messages;
      } catch {}
      return new Response(JSON.stringify({ project, messages }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Project not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // List all projects
  try {
    await mkdir(PROJECTS_DIR, { recursive: true });
    const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects: SavedProject[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const raw = await readFile(projectFile(entry.name), "utf-8");
        projects.push(JSON.parse(raw) as SavedProject);
      } catch {}
    }

    // Sort by updatedAt descending
    projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return new Response(JSON.stringify({ projects }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ projects: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request, url }) => {
  const action = url.searchParams.get("action");
  const body = await request.json();

  if (action === "chat") {
    // Save chat messages for a project
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response("Missing project id", { status: 400 });
    }
    try {
      await mkdir(projectDir(id), { recursive: true });
      const chatData: SavedChat = { messages: body.messages ?? [] };
      await writeFile(chatFile(id), JSON.stringify(chatData, null, 2), "utf-8");
      // Update project's updatedAt
      try {
        const raw = await readFile(projectFile(id), "utf-8");
        const project = JSON.parse(raw) as SavedProject;
        project.updatedAt = new Date().toISOString();
        await writeFile(projectFile(id), JSON.stringify(project, null, 2), "utf-8");
      } catch {}
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(err?.message ?? "Failed to save chat", {
        status: 500,
      });
    }
  }

  // Create or update project
  const project = body as SavedProject;
  if (!project.id || !project.name) {
    return new Response("Missing id or name", { status: 400 });
  }

  try {
    await mkdir(projectDir(project.id), { recursive: true });
    const now = new Date().toISOString();
    // Check if project already exists
    let existing: SavedProject | null = null;
    try {
      const raw = await readFile(projectFile(project.id), "utf-8");
      existing = JSON.parse(raw) as SavedProject;
    } catch {}

    const saved: SavedProject = {
      ...project,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await writeFile(projectFile(project.id), JSON.stringify(saved, null, 2), "utf-8");

    return new Response(JSON.stringify({ ok: true, project: saved }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(err?.message ?? "Failed to save project", {
      status: 500,
    });
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response("Missing project id", { status: 400 });
  }

  try {
    const { rm } = await import("node:fs/promises");
    await rm(projectDir(id), { recursive: true, force: true });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(err?.message ?? "Failed to delete project", {
      status: 500,
    });
  }
};
