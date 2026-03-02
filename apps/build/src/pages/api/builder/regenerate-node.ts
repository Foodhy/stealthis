import type { APIRoute } from "astro";
import { BuilderExecutionPlanSchema } from "../../../lib/builder/contracts";
import { createDeterministicPlan } from "../../../lib/builder/planner";
import { createRegeneratedScaffold } from "../../../lib/builder/templates";
import { jsonError, jsonResponse, parsePayloadFromBody } from "./_shared";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as {
      project?: unknown;
      targetNodeId?: unknown;
      plan?: unknown;
      llm?: unknown;
    };

    const { project } = parsePayloadFromBody({
      project: body.project,
      llm: body.llm,
    });

    if (typeof body.targetNodeId !== "string" || !body.targetNodeId) {
      return jsonError("targetNodeId is required.", 400);
    }

    const parsedPlan = BuilderExecutionPlanSchema.safeParse(body.plan);
    const plan = parsedPlan.success ? parsedPlan.data : createDeterministicPlan(project);
    const result = createRegeneratedScaffold(project, plan, body.targetNodeId);

    return jsonResponse({
      ok: true,
      targetNodeId: body.targetNodeId,
      changedPaths: result.changedPaths,
      scaffold: {
        files: result.files,
        manifest: result.manifest,
        warnings: result.warnings,
      },
    });
  } catch (error) {
    return jsonError(error, 400);
  }
};
