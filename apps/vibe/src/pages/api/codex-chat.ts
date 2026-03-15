import type { APIRoute } from "astro";
import { spawn } from "node:child_process";

export const prerender = false;

type ChatMsg = { role: string; content: string };

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json()) as {
    model?: string;
    messages?: ChatMsg[];
  };

  const model = body.model || "gpt-5.3-codex";
  const messages = body.messages ?? [];

  // Build prompt from messages: system instructions + conversation
  const parts: string[] = [];
  for (const m of messages) {
    if (m.role === "system") {
      parts.push(`[System instructions]\n${m.content}`);
    } else if (m.role === "user") {
      parts.push(`User: ${m.content}`);
    } else if (m.role === "assistant") {
      parts.push(`Assistant: ${m.content}`);
    }
  }
  parts.push("Assistant:");
  const prompt = parts.join("\n\n");

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const proc = spawn("codex", [
        "exec",
        "--json",
        "-m", model,
        "--skip-git-repo-check",
        "--sandbox", "read-only",
        prompt,
      ], {
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env, NO_COLOR: "1" },
      });

      proc.stdout.on("data", (data: Buffer) => {
        const text = data.toString();
        for (const line of text.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const event = JSON.parse(trimmed);
            // Extract agent_message events
            if (event.msg?.type === "agent_message") {
              const token = event.msg.message ?? "";
              if (token) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ token })}\n\n`),
                );
              }
            }
          } catch {
            // Not JSON, ignore
          }
        }
      });

      proc.stderr.on("data", (data: Buffer) => {
        // Ignore stderr (codex prints spinners/progress there)
      });

      proc.on("close", () => {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      });

      proc.on("error", (err) => {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: err.message })}\n\n`,
          ),
        );
        controller.close();
      });

      // Close stdin immediately since we pass prompt as argument
      proc.stdin.end();
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
