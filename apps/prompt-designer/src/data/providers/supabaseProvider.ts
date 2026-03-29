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
import { assertSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import { InformationSource, InformationSourceInput } from '@/types/dataSource';

const mapRowToInformationSource = (row: Record<string, unknown>): InformationSource => ({
  id: row.id as number,
  author_id: row.author_id as number,
  name: (row.name as string) || '',
  description: (row.description as string) || undefined,
  source_type: (row.source_type as InformationSource['source_type']) || 'text',
  content: (row.content as string) || undefined,
  url: (row.url as string) || undefined,
  metadata: (row.metadata as Record<string, unknown>) || undefined,
  is_active: (row.is_active as boolean) ?? true,
  created_at: (row.created_at as string) || new Date().toISOString(),
  updated_at: (row.updated_at as string) || new Date().toISOString(),
});

const getOrCreateAuthor = async (authorName: string, authorEmail?: string, authorTeam?: string): Promise<number> => {
  if (!authorName.trim()) throw new Error('Author name is required');
  const { data, error } = await supabase.rpc('get_or_create_author', {
    author_name: authorName.trim(),
    author_email: authorEmail?.trim() || null,
    author_team: authorTeam?.trim() || null,
  });

  if (error) throw new Error(`Failed to get or create author: ${error.message}`);
  return data as number;
};

const getOrCreateTag = async (tagName: string): Promise<number> => {
  if (!tagName.trim()) throw new Error('Tag name is required');

  const { data, error } = await supabase.rpc('get_or_create_tag', {
    tag_name: tagName.trim(),
  });

  if (error) throw new Error(`Failed to get or create tag: ${error.message}`);
  return data as number;
};

const getToolIdMap = async (): Promise<Map<string, number>> => {
  const toolMap = new Map<string, number>();
  const { data } = await supabase.from('tools').select('id, name');
  if (data) {
    data.forEach((t) => toolMap.set(t.name as string, t.id as number));
  }
  return toolMap;
};

const syncComponents = async (
  promptId: number,
  sections: Record<string, string>,
  sectionOrder: string[],
): Promise<void> => {
  const { data: existing } = await supabase
    .from('prompt_components')
    .select('id, component_key')
    .eq('prompt_id', promptId);

  const existingKeys = new Set((existing || []).map((c) => c.component_key as string));
  const currentKeys = new Set(Object.keys(sections));

  const toAdd: string[] = [];
  const toUpdate: string[] = [];
  const toDelete: string[] = [];

  currentKeys.forEach((k) => (existingKeys.has(k) ? toUpdate.push(k) : toAdd.push(k)));
  existingKeys.forEach((k) => !currentKeys.has(k) && toDelete.push(k));

  if (toDelete.length) {
    await supabase
      .from('prompt_components')
      .delete()
      .eq('prompt_id', promptId)
      .in('component_key', toDelete);
  }

  const TITLES: Record<string, string> = {
    identity_role: 'Identity and Role',
    steps_objectives: 'Steps and Goals',
    available_tools: 'Available Tools',
  };
  const DEFAULTS = ['identity_role', 'steps_objectives', 'available_tools'];

  const getLabel = (k: string) =>
    TITLES[k] ||
    k
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const getOrder = (k: string) => {
    const idx = DEFAULTS.indexOf(k);
    if (idx >= 0) return idx + 1;
    const customIdx = sectionOrder.indexOf(k);
    return DEFAULTS.length + 1 + (customIdx >= 0 ? customIdx : 0);
  };

  if (toAdd.length) {
    await supabase.from('prompt_components').insert(
      toAdd.map((k) => ({
        prompt_id: promptId,
        component_key: k,
        component_label: getLabel(k),
        content: sections[k] || '',
        order_index: getOrder(k),
        is_enabled: true,
      })),
    );
  }

  for (const k of toUpdate) {
    await supabase
      .from('prompt_components')
      .update({
        content: sections[k] || '',
        component_label: getLabel(k),
        order_index: getOrder(k),
      })
      .eq('prompt_id', promptId)
      .eq('component_key', k);
  }
};

const syncTags = async (promptId: number, tags: string[]): Promise<void> => {
  await supabase.from('prompt_tags').delete().eq('prompt_id', promptId);

  for (const tag of tags) {
    const tagId = await getOrCreateTag(tag);
    await supabase.from('prompt_tags').insert({ prompt_id: promptId, tag_id: tagId });
  }
};

const syncTagsByIds = async (promptId: number, tagIds: number[]): Promise<void> => {
  await supabase.from('prompt_tags').delete().eq('prompt_id', promptId);
  for (const tagId of tagIds) {
    await supabase.from('prompt_tags').insert({ prompt_id: promptId, tag_id: tagId });
  }
};

const syncTools = async (promptId: number, tools: Record<string, boolean>, toolMap: Map<string, number>): Promise<void> => {
  await supabase.from('prompt_tools').delete().eq('prompt_id', promptId);
  const toolsToAdd = Object.entries(tools)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);

  for (const name of toolsToAdd) {
    const id = toolMap.get(name);
    if (id) {
      await supabase.from('prompt_tools').insert({ prompt_id: promptId, tool_id: id, is_enabled: true });
    }
  }
};

const syncVariables = async (promptId: number, variables: string[]): Promise<void> => {
  const { data: existing } = await supabase
    .from('prompt_variables')
    .select('id, variable_name')
    .eq('prompt_id', promptId);

  const existingNames = new Set((existing || []).map((v) => v.variable_name as string));
  const currentNames = new Set(variables);

  const toAdd = variables.filter((v) => !existingNames.has(v));
  const toDeleteIds = (existing || [])
    .filter((v) => !currentNames.has(v.variable_name as string))
    .map((v) => v.id as number);

  if (toDeleteIds.length) {
    await supabase.from('prompt_variables').delete().in('id', toDeleteIds);
  }
  if (toAdd.length) {
    await supabase.from('prompt_variables').insert(
      toAdd.map((v) => ({
        prompt_id: promptId,
        variable_name: v,
        variable_type: 'text',
      })),
    );
  }
};

const createHistoryEntry = async (
  promptId: number,
  previousVersionId: number,
  data: PromptPayload,
  changedById: number,
): Promise<void> => {
  await supabase.from('prompt_history').insert({
    prompt_id: promptId,
    previous_version_id: previousVersionId,
    change_type: 'updated',
    changed_by_id: changedById,
    change_message: `Updated version ${data.metadata.version}`,
  });
};

export const supabaseDataProvider: DataProvider = {
  kind: 'supabase',

  prompts: {
    async getPromptSummaries(): Promise<PromptSummary[]> {
      assertSupabaseConfigured('listar prompts');
      const { data, error } = await supabase
        .from('latest_prompts_consolidated')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to load prompts: ${error.message}`);
      }

      return ((data || []) as unknown[]).map((row) => row as PromptSummary);
    },

    async loadPrompt(promptId: number): Promise<LoadedPromptData> {
      assertSupabaseConfigured('cargar prompts');

      const { data: prompt, error: promptError } = await supabase
        .from('prompts')
        .select('*, authors (name, email, team)')
        .eq('id', promptId)
        .single();

      if (promptError || !prompt) {
        throw new Error(`Failed to load prompt: ${promptError?.message || 'Prompt not found'}`);
      }

      const { data: components, error: componentsError } = await supabase
        .from('prompt_components')
        .select('*')
        .eq('prompt_id', promptId)
        .order('order_index');
      if (componentsError) throw new Error(`Failed to load components: ${componentsError.message}`);

      const { data: promptTags, error: tagsError } = await supabase
        .from('prompt_tags')
        .select('tag_id, tags (name)')
        .eq('prompt_id', promptId);
      if (tagsError) throw new Error(`Failed to load tags: ${tagsError.message}`);

      const { data: promptTools, error: toolsError } = await supabase
        .from('prompt_tools')
        .select('tool_id, is_enabled, tools (name)')
        .eq('prompt_id', promptId);
      if (toolsError) throw new Error(`Failed to load tools: ${toolsError.message}`);

      const { data: variables, error: variablesError } = await supabase
        .from('prompt_variables')
        .select('variable_name')
        .eq('prompt_id', promptId)
        .order('variable_name');
      if (variablesError) throw new Error(`Failed to load variables: ${variablesError.message}`);

      const sections: Record<string, string> = {};
      (components || []).forEach((comp) => {
        sections[comp.component_key as string] = (comp.content as string) || '';
      });

      const tags = (promptTags || [])
        .map((pt) => (pt.tags as { name?: string } | null)?.name)
        .filter((value): value is string => Boolean(value));

      const tools: Record<string, boolean> = {};
      (promptTools || []).forEach((pt) => {
        const toolName = (pt.tools as { name?: string } | null)?.name;
        if (toolName && pt.is_enabled) tools[toolName] = true;
      });

      const STANDARD_DEFAULTS = ['identity_role', 'steps_objectives', 'available_tools'];
      const sectionOrder = (components || [])
        .filter((comp) => !STANDARD_DEFAULTS.includes(comp.component_key as string))
        .map((comp) => comp.component_key as string);

      const authorName = ((prompt.authors as { name?: string } | null)?.name) || '';

      return {
        id: prompt.id as number,
        metadata: {
          version: (prompt.version as string) || '',
          author: authorName,
          lastModified:
            (prompt.updated_at as string) ||
            (prompt.created_at as string) ||
            new Date().toISOString(),
          title: (prompt.title as string) || '',
          description: (prompt.description as string) || '',
          tags,
        },
        sections,
        sectionOrder,
        tools,
        variables: (variables || []).map((v) => v.variable_name as string),
      };
    },

    async savePrompt(
      promptData: PromptPayload,
      previousPromptId?: number | null,
      variables: string[] = [],
      authorId?: number | null,
      tagIds: number[] = [],
    ): Promise<number> {
      assertSupabaseConfigured('guardar prompts');

      const toolMap = await getToolIdMap();
      const finalAuthorId = authorId || (await getOrCreateAuthor(promptData.metadata.author || 'Unknown'));

      const isNew = !previousPromptId;
      let promptId: number;

      const upsertData = {
        title: promptData.metadata.title || `Prompt v${promptData.metadata.version}`,
        author_id: finalAuthorId,
        version: promptData.metadata.version,
        description: promptData.metadata.description,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        const { data: newPrompt, error: createError } = await supabase
          .from('prompts')
          .insert(upsertData)
          .select('id')
          .single();

        if (createError || !newPrompt) {
          throw new Error(`Failed to create prompt: ${createError?.message || 'Unknown error'}`);
        }
        promptId = newPrompt.id as number;
      } else {
        const { error: updateError } = await supabase
          .from('prompts')
          .update(upsertData)
          .eq('id', previousPromptId);

        if (updateError) throw new Error(`Failed to update prompt: ${updateError.message}`);
        promptId = previousPromptId;
      }

      await syncComponents(promptId, promptData.sections, promptData.sectionOrder || []);

      if (tagIds.length > 0) {
        await syncTagsByIds(promptId, tagIds);
      } else {
        await syncTags(promptId, promptData.metadata.tags);
      }

      await syncTools(promptId, promptData.tools, toolMap);
      await syncVariables(promptId, variables);

      if (!isNew && previousPromptId) {
        await createHistoryEntry(promptId, previousPromptId, promptData, finalAuthorId);
      }

      return promptId;
    },

    async deletePrompt(id: number): Promise<void> {
      assertSupabaseConfigured('eliminar prompts');
      const { error } = await supabase.from('prompts').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  },

  values: {
    async getAuthors() {
      assertSupabaseConfigured('cargar autores');
      const { data, error } = await supabase.from('authors').select('*').order('name');
      if (error) throw error;
      return (data || []) as Author[];
    },
    async createAuthor(author) {
      assertSupabaseConfigured('crear autor');
      const { data, error } = await supabase.from('authors').insert(author).select().single();
      if (error) throw error;
      return data as Author;
    },
    async updateAuthor(id, updates) {
      assertSupabaseConfigured('actualizar autor');
      const payload = { ...updates };
      const { data, error } = await supabase
        .from('authors')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Author;
    },
    async deleteAuthor(id) {
      assertSupabaseConfigured('eliminar autor');
      const { error } = await supabase.from('authors').delete().eq('id', id);
      if (error) throw error;
    },

    async getTags() {
      assertSupabaseConfigured('cargar tags');
      const { data, error } = await supabase.from('tags').select('*').order('name');
      if (error) throw error;
      return (data || []) as Tag[];
    },
    async createTag(name) {
      assertSupabaseConfigured('crear tag');
      const { data, error } = await supabase.from('tags').insert({ name }).select().single();
      if (error) throw error;
      return data as Tag;
    },
    async deleteTag(id) {
      assertSupabaseConfigured('eliminar tag');
      const { error } = await supabase.from('tags').delete().eq('id', id);
      if (error) throw error;
    },

    async getTools() {
      assertSupabaseConfigured('cargar tools');
      const { data, error } = await supabase.from('tools').select('*').order('name');
      if (error) throw error;
      return (data || []) as Tool[];
    },
    async createTool(tool) {
      assertSupabaseConfigured('crear tool');
      const { data, error } = await supabase.from('tools').insert(tool).select().single();
      if (error) throw error;
      return data as Tool;
    },
    async updateTool(id, updates) {
      assertSupabaseConfigured('actualizar tool');
      const payload = { ...updates };
      const { data, error } = await supabase
        .from('tools')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Tool;
    },
    async deleteTool(id) {
      assertSupabaseConfigured('eliminar tool');
      const { error } = await supabase.from('tools').delete().eq('id', id);
      if (error) throw error;
    },

    async getGlobalVariables() {
      assertSupabaseConfigured('cargar variables');
      const { data, error } = await supabase
        .from('prompt_variables')
        .select('*')
        .is('prompt_id', null)
        .order('variable_name');
      if (error) throw error;
      return (data || []) as PromptVariable[];
    },
    async createGlobalVariable(variable) {
      assertSupabaseConfigured('crear variable');
      const { data, error } = await supabase
        .from('prompt_variables')
        .insert({
          prompt_id: null,
          variable_name: variable.variable_name,
          variable_type: variable.variable_type || 'text',
          description: variable.description,
        })
        .select()
        .single();
      if (error) throw error;
      return data as PromptVariable;
    },
    async deleteGlobalVariable(id) {
      assertSupabaseConfigured('eliminar variable');
      const { error } = await supabase.from('prompt_variables').delete().eq('id', id);
      if (error) throw error;
    },
  },

  sources: {
    async getAllSources() {
      assertSupabaseConfigured('cargar fuentes');
      const { data, error } = await supabase
        .from('information_sources')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(`Failed to load sources: ${error.message}`);
      return (data || []).map((row) => mapRowToInformationSource(row as Record<string, unknown>));
    },

    async getSourceById(id: number) {
      assertSupabaseConfigured('cargar fuente');
      const { data, error } = await supabase
        .from('information_sources')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Failed to load source: ${error.message}`);
      }

      return data ? mapRowToInformationSource(data as Record<string, unknown>) : null;
    },

    async addSource(input: InformationSourceInput) {
      assertSupabaseConfigured('crear fuente');
      const authorId = await getOrCreateAuthor('System');

      const { data, error } = await supabase
        .from('information_sources')
        .insert({
          author_id: authorId,
          name: input.name,
          description: input.description || null,
          source_type: input.source_type,
          content: input.content || null,
          url: input.url || null,
          metadata: input.metadata || null,
          is_active: true,
        })
        .select()
        .single();

      if (error || !data) throw new Error(`Failed to create source: ${error?.message || 'Unknown error'}`);
      return mapRowToInformationSource(data as Record<string, unknown>);
    },

    async updateSource(id: number, input: Partial<InformationSourceInput>) {
      assertSupabaseConfigured('actualizar fuente');
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description || null;
      if (input.source_type !== undefined) updateData.source_type = input.source_type;
      if (input.content !== undefined) updateData.content = input.content || null;
      if (input.url !== undefined) updateData.url = input.url || null;
      if (input.metadata !== undefined) updateData.metadata = input.metadata || null;

      const { error } = await supabase.from('information_sources').update(updateData).eq('id', id);
      if (error) throw new Error(`Failed to update source: ${error.message}`);
    },

    async deleteSource(id: number) {
      assertSupabaseConfigured('eliminar fuente');
      const { error } = await supabase.from('information_sources').delete().eq('id', id);
      if (error) throw new Error(`Failed to delete source: ${error.message}`);
    },
  },
};
