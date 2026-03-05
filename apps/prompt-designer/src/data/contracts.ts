import { InformationSource, InformationSourceInput } from '@/types/dataSource';

export interface Author {
  id: number;
  name: string;
  email?: string;
  team?: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Tool {
  id: number;
  name: string;
  description?: string;
  configuration?: Record<string, unknown>;
}

export interface PromptVariable {
  id: number;
  prompt_id?: number | null;
  variable_name: string;
  variable_type: string;
  description?: string;
  is_required?: boolean;
}

export interface PromptPayload {
  metadata: {
    version: string;
    author: string;
    lastModified: string;
    title: string;
    description: string;
    tags: string[];
  };
  sections: Record<string, string>;
  sectionOrder?: string[];
  tools: Record<string, boolean>;
}

export interface LoadedPromptData extends PromptPayload {
  id: number;
  variables: string[];
}

export interface PromptSummary {
  id: number;
  title: string;
  description: string | null;
  version: string;
  author_name: string | null;
  author_team: string | null;
  tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  variable_count: number | null;
}

export interface PromptProvider {
  getPromptSummaries(): Promise<PromptSummary[]>;
  loadPrompt(promptId: number): Promise<LoadedPromptData>;
  savePrompt(
    promptData: PromptPayload,
    previousPromptId?: number | null,
    variables?: string[],
    authorId?: number | null,
    tagIds?: number[],
  ): Promise<number>;
  deletePrompt(id: number): Promise<void>;
}

export interface ValuesProvider {
  getAuthors(): Promise<Author[]>;
  createAuthor(author: Omit<Author, 'id'>): Promise<Author>;
  updateAuthor(id: number, updates: Partial<Author>): Promise<Author>;
  deleteAuthor(id: number): Promise<void>;

  getTags(): Promise<Tag[]>;
  createTag(name: string): Promise<Tag>;
  deleteTag(id: number): Promise<void>;

  getTools(): Promise<Tool[]>;
  createTool(tool: Omit<Tool, 'id'>): Promise<Tool>;
  updateTool(id: number, updates: Partial<Tool>): Promise<Tool>;
  deleteTool(id: number): Promise<void>;

  getGlobalVariables(): Promise<PromptVariable[]>;
  createGlobalVariable(variable: Pick<PromptVariable, 'variable_name' | 'description' | 'variable_type'>): Promise<PromptVariable>;
  deleteGlobalVariable(id: number): Promise<void>;
}

export interface SourcesProvider {
  getAllSources(): Promise<InformationSource[]>;
  getSourceById(id: number): Promise<InformationSource | null>;
  addSource(input: InformationSourceInput): Promise<InformationSource>;
  updateSource(id: number, input: Partial<InformationSourceInput>): Promise<void>;
  deleteSource(id: number): Promise<void>;
}

export interface DataProvider {
  kind: 'local' | 'supabase';
  prompts: PromptProvider;
  values: ValuesProvider;
  sources: SourcesProvider;
}
