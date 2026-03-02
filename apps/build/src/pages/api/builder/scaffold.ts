import type { APIRoute } from "astro";
import { BuilderExecutionPlanSchema } from "../../../lib/builder/contracts";
import { createDeterministicPlan } from "../../../lib/builder/planner";
import { createScaffold } from "../../../lib/builder/templates";
import { jsonError, jsonResponse, parsePayloadFromBody } from "./_shared";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as {
      project?: unknown;
      plan?: unknown;
      llm?: unknown;
    };

    const { project } = parsePayloadFromBody({
      project: body.project,
      llm: body.llm,
    });

    const parsedPlan = BuilderExecutionPlanSchema.safeParse(body.plan);
    const plan = parsedPlan.success ? parsedPlan.data : createDeterministicPlan(project);
    const scaffold = createScaffold(project, plan);

    return jsonResponse({ ok: true, scaffold, plan });
  } catch (error) {
    return jsonError(error, 400);
  }
};
