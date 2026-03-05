import {
  Author,
  DataProvider,
  LoadedPromptData,
  PromptPayload,
  PromptSummary,
  PromptVariable,
  Tag,
  Tool,
} from '@/data/contracts';
import { InformationSource, InformationSourceInput } from '@/types/dataSource';
import { localStorageService } from '@/services/localStorageService';

const AUTHORS_KEY = 'pd_values_authors';
const TAGS_KEY = 'pd_values_tags';
const TOOLS_KEY = 'pd_values_tools';
const VARIABLES_KEY = 'pd_values_global_variables';
const PROMPTS_KEY = 'pd_prompts';

interface LocalPromptRecord {
  id: number;
  metadata: PromptPayload['metadata'];
  sections: Record<string, string>;
  sectionOrder?: string[];
  tools: Record<string, boolean>;
  variables: string[];
  author_id: number | null;
  tag_ids: number[];
  created_at: string;
  updated_at: string;
}

const parseJson = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const readCollection = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  return parseJson<T>(localStorage.getItem(key), fallback);
};

const writeCollection = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

const nextId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

const seedAuthors = (): Author[] => {
  const current = readCollection<Author[]>(AUTHORS_KEY, []);
  if (current.length > 0) return current;
  const seeded = [{ id: 1, name: 'System', email: '', team: '' }];
  writeCollection(AUTHORS_KEY, seeded);
  return seeded;
};

const getAuthorsStore = (): Author[] => seedAuthors();
const saveAuthorsStore = (authors: Author[]) => writeCollection(AUTHORS_KEY, authors);

const getTagsStore = (): Tag[] => readCollection<Tag[]>(TAGS_KEY, []);
const saveTagsStore = (tags: Tag[]) => writeCollection(TAGS_KEY, tags);

const getToolsStore = (): Tool[] => readCollection<Tool[]>(TOOLS_KEY, []);
const saveToolsStore = (tools: Tool[]) => writeCollection(TOOLS_KEY, tools);

const getVariablesStore = (): PromptVariable[] => readCollection<PromptVariable[]>(VARIABLES_KEY, []);
const saveVariablesStore = (variables: PromptVariable[]) => writeCollection(VARIABLES_KEY, variables);

const getPromptsStore = (): LocalPromptRecord[] => readCollection<LocalPromptRecord[]>(PROMPTS_KEY, []);
const savePromptsStore = (prompts: LocalPromptRecord[]) => writeCollection(PROMPTS_KEY, prompts);

const findOrCreateAuthorByName = (name: string): Author => {
  const trimmed = name.trim() || 'Unknown';
  const authors = getAuthorsStore();
  const found = authors.find((a) => a.name.toLowerCase() === trimmed.toLowerCase());
  if (found) return found;
  const created: Author = { id: nextId(), name: trimmed };
  const updated = [...authors, created].sort((a, b) => a.name.localeCompare(b.name));
  saveAuthorsStore(updated);
  return created;
};

const findOrCreateTagIds = (tagNames: string[]): number[] => {
  const tags = getTagsStore();
  const ids: number[] = [];
  const mutable = [...tags];

  for (const name of tagNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const existing = mutable.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      ids.push(existing.id);
      continue;
    }
    const created: Tag = { id: nextId(), name: trimmed };
    mutable.push(created);
    ids.push(created.id);
  }

  saveTagsStore(mutable.sort((a, b) => a.name.localeCompare(b.name)));
  return ids;
};

export const localDataProvider: DataProvider = {
  kind: 'local',
  prompts: {
    async getPromptSummaries(): Promise<PromptSummary[]> {
      const prompts = getPromptsStore();
      const authors = getAuthorsStore();
      const tags = getTagsStore();

      return prompts
        .map((p) => {
          const author = p.author_id ? authors.find((a) => a.id === p.author_id) : null;
          const tagNames = p.tag_ids
            .map((tagId) => tags.find((t) => t.id === tagId)?.name)
            .filter((value): value is string => Boolean(value));

          return {
            id: p.id,
            title: p.metadata.title || 'Prompt sin titulo',
            description: p.metadata.description || null,
            version: p.metadata.version || '0.0.0',
            author_name: author?.name ?? p.metadata.author ?? null,
            author_team: author?.team ?? null,
            tags: tagNames,
            created_at: p.created_at,
            updated_at: p.updated_at,
            variable_count: p.variables.length,
          } as PromptSummary;
        })
        .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
    },

    async loadPrompt(promptId: number): Promise<LoadedPromptData> {
      const prompt = getPromptsStore().find((p) => p.id === promptId);
      if (!prompt) {
        throw new Error('Prompt no encontrado en almacenamiento local');
      }

      return {
        id: prompt.id,
        metadata: prompt.metadata,
        sections: prompt.sections,
        sectionOrder: prompt.sectionOrder || [],
        tools: prompt.tools,
        variables: prompt.variables || [],
      };
    },

    async savePrompt(
      promptData: PromptPayload,
      previousPromptId?: number | null,
      variables: string[] = [],
      authorId?: number | null,
      tagIds: number[] = [],
    ): Promise<number> {
      const prompts = getPromptsStore();
      const now = new Date().toISOString();

      const finalAuthorId = authorId ?? findOrCreateAuthorByName(promptData.metadata.author).id;
      const finalTagIds = tagIds.length > 0 ? tagIds : findOrCreateTagIds(promptData.metadata.tags);

      if (previousPromptId) {
        const idx = prompts.findIndex((p) => p.id === previousPromptId);
        if (idx >= 0) {
          prompts[idx] = {
            ...prompts[idx],
            metadata: { ...promptData.metadata, lastModified: now },
            sections: promptData.sections,
            sectionOrder: promptData.sectionOrder || [],
            tools: promptData.tools,
            variables,
            author_id: finalAuthorId,
            tag_ids: finalTagIds,
            updated_at: now,
          };
          savePromptsStore(prompts);
          return previousPromptId;
        }
      }

      const newId = nextId();
      const created: LocalPromptRecord = {
        id: newId,
        metadata: { ...promptData.metadata, lastModified: now },
        sections: promptData.sections,
        sectionOrder: promptData.sectionOrder || [],
        tools: promptData.tools,
        variables,
        author_id: finalAuthorId,
        tag_ids: finalTagIds,
        created_at: now,
        updated_at: now,
      };

      savePromptsStore([created, ...prompts]);
      return newId;
    },

    async deletePrompt(id: number): Promise<void> {
      const filtered = getPromptsStore().filter((p) => p.id !== id);
      savePromptsStore(filtered);
    },
  },

  values: {
    async getAuthors() {
      return getAuthorsStore().sort((a, b) => a.name.localeCompare(b.name));
    },
    async createAuthor(author) {
      const authors = getAuthorsStore();
      const created: Author = { ...author, id: nextId() };
      saveAuthorsStore([...authors, created]);
      return created;
    },
    async updateAuthor(id, updates) {
      const authors = getAuthorsStore();
      const idx = authors.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error('Autor no encontrado');
      authors[idx] = { ...authors[idx], ...updates, id };
      saveAuthorsStore(authors);
      return authors[idx];
    },
    async deleteAuthor(id) {
      saveAuthorsStore(getAuthorsStore().filter((a) => a.id !== id));
    },

    async getTags() {
      return getTagsStore().sort((a, b) => a.name.localeCompare(b.name));
    },
    async createTag(name) {
      const tags = getTagsStore();
      const created: Tag = { id: nextId(), name };
      saveTagsStore([...tags, created]);
      return created;
    },
    async deleteTag(id) {
      saveTagsStore(getTagsStore().filter((t) => t.id !== id));
    },

    async getTools() {
      return getToolsStore().sort((a, b) => a.name.localeCompare(b.name));
    },
    async createTool(tool) {
      const tools = getToolsStore();
      const created: Tool = { ...tool, id: nextId() };
      saveToolsStore([...tools, created]);
      return created;
    },
    async updateTool(id, updates) {
      const tools = getToolsStore();
      const idx = tools.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error('Tool no encontrado');
      tools[idx] = { ...tools[idx], ...updates, id };
      saveToolsStore(tools);
      return tools[idx];
    },
    async deleteTool(id) {
      saveToolsStore(getToolsStore().filter((t) => t.id !== id));
    },

    async getGlobalVariables() {
      return getVariablesStore().sort((a, b) => a.variable_name.localeCompare(b.variable_name));
    },
    async createGlobalVariable(variable) {
      const variables = getVariablesStore();
      const created: PromptVariable = {
        id: nextId(),
        prompt_id: null,
        variable_name: variable.variable_name,
        variable_type: variable.variable_type || 'text',
        description: variable.description,
        is_required: false,
      };
      saveVariablesStore([...variables, created]);
      return created;
    },
    async deleteGlobalVariable(id) {
      saveVariablesStore(getVariablesStore().filter((v) => v.id !== id));
    },
  },

  sources: {
    async getAllSources(): Promise<InformationSource[]> {
      return localStorageService.getAll();
    },
    async getSourceById(id: number): Promise<InformationSource | null> {
      return localStorageService.getById(id) ?? null;
    },
    async addSource(input: InformationSourceInput): Promise<InformationSource> {
      return localStorageService.add(input);
    },
    async updateSource(id: number, input: Partial<InformationSourceInput>): Promise<void> {
      localStorageService.update(id, input);
    },
    async deleteSource(id: number): Promise<void> {
      localStorageService.delete(id);
    },
  },
};
