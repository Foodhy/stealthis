import { getDataProvider } from "@/data/providerFactory";
import type { Author, PromptVariable, Tag, Tool } from "@/data/contracts";

export type { Author, Tag, Tool, PromptVariable };

export const valuesService = {
  getAuthors: async () => getDataProvider().values.getAuthors(),
  createAuthor: async (author: Omit<Author, "id">) => getDataProvider().values.createAuthor(author),
  updateAuthor: async (id: number, updates: Partial<Author>) =>
    getDataProvider().values.updateAuthor(id, updates),
  deleteAuthor: async (id: number) => getDataProvider().values.deleteAuthor(id),

  getTags: async () => getDataProvider().values.getTags(),
  createTag: async (name: string) => getDataProvider().values.createTag(name),
  deleteTag: async (id: number) => getDataProvider().values.deleteTag(id),

  getTools: async () => getDataProvider().values.getTools(),
  createTool: async (tool: Omit<Tool, "id">) => getDataProvider().values.createTool(tool),
  updateTool: async (id: number, updates: Partial<Tool>) =>
    getDataProvider().values.updateTool(id, updates),
  deleteTool: async (id: number) => getDataProvider().values.deleteTool(id),

  getGlobalVariables: async () => getDataProvider().values.getGlobalVariables(),
  createGlobalVariable: async (
    variable: Pick<PromptVariable, "variable_name" | "description" | "variable_type">
  ) => getDataProvider().values.createGlobalVariable(variable),
  deleteGlobalVariable: async (id: number) => getDataProvider().values.deleteGlobalVariable(id),
};
