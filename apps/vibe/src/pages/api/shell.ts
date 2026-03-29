import type { APIRoute } from "astro";
import { spawn } from "node:child_process";
import { access, mkdir } from "node:fs/promises";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json()) as { command?: string; cwd?: string };
  const command = body.command?.trim();

  if (!command) {
    return new Response("Missing command", { status: 400 });
  }

  // Block dangerous patterns
  const blocked = /\b(rm\s+-rf\s+\/|mkfs|dd\s+if=|:(){ :|fork\s*bomb)\b/i;
  if (blocked.test(command)) {
    return new Response("Command blocked for safety", { status: 403 });
  }

  const cwd = body.cwd || process.cwd();

  // Ensure cwd exists before spawning
  try {
    await access(cwd);
  } catch {
    try {
      await mkdir(cwd, { recursive: true });
    } catch {
      return new Response(JSON.stringify({ error: `Cannot access directory: ${cwd}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      function send(obj: Record<string, unknown>) {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data:${JSON.stringify(obj)}\n\n`));
        } catch {
          // Stream already closed by client disconnect
          closed = true;
        }
      }

      function close() {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // Already closed
        }
      }

      let child: ReturnType<typeof spawn>;
      try {
        child = spawn(command, {
          shell: true,
          cwd,
          env: { ...process.env, FORCE_COLOR: "1", TERM: "xterm-256color" },
          detached: true, // Create process group so we can kill the whole tree
        });
      } catch (err: any) {
        send({ type: "stderr", data: err?.message ?? "Failed to spawn process" });
        send({ type: "exit", code: 1 });
        close();
        return;
      }

      child.stdout?.on("data", (data: Buffer) => {
        const text = data.toString();
        for (const line of text.split("\n")) {
          if (line) send({ type: "stdout", data: line });
        }
      });

      child.stderr?.on("data", (data: Buffer) => {
        const text = data.toString();
        for (const line of text.split("\n")) {
          if (line) send({ type: "stderr", data: line });
        }
      });

      child.on("close", (code) => {
        send({ type: "cwd", data: cwd });
        send({ type: "exit", code: code ?? 0 });
        close();
      });

      child.on("error", (err) => {
        send({ type: "stderr", data: err.message });
        send({ type: "exit", code: 1 });
        close();
      });

      // Kill entire process group on abort
      function killChild() {
        try {
          if (child.pid) process.kill(-child.pid, "SIGTERM");
        } catch {
          try {
            child.kill("SIGTERM");
          } catch {}
        }
      }

      request.signal.addEventListener("abort", () => {
        killChild();
        close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
