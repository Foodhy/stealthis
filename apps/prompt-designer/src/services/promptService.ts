import { getDataProvider } from "@/data/providerFactory";
import type { LoadedPromptData, PromptSummary } from "@/data/contracts";
import type { PromptData } from "@/components/PromptEditor";

export type { LoadedPromptData, PromptSummary };

export async function listPromptSummaries(): Promise<PromptSummary[]> {
  return getDataProvider().prompts.getPromptSummaries();
}

export async function loadPrompt(promptId: number): Promise<LoadedPromptData> {
  return getDataProvider().prompts.loadPrompt(promptId);
}

export async function savePrompt(
  promptData: PromptData,
  previousPromptId?: number | null,
  variables?: string[],
  authorId?: number | null,
  tagIds?: number[]
): Promise<number> {
  return getDataProvider().prompts.savePrompt(
    promptData,
    previousPromptId,
    variables,
    authorId,
    tagIds
  );
}

export async function deletePrompt(id: number): Promise<void> {
  return getDataProvider().prompts.deletePrompt(id);
}
