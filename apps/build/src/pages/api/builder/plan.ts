import type { APIRoute } from "astro";
import { generateExecutionPlan } from "../../../lib/builder/planner";
import { jsonError, jsonResponse, parsePayload } from "./_shared";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { project, llm } = await parsePayload(request);
    const result = await generateExecutionPlan(project, llm);

    return jsonResponse({
      ok: true,
      mode: result.mode,
      plan: result.plan,
    });
  } catch (error) {
    return jsonError(error, 400);
  }
};
