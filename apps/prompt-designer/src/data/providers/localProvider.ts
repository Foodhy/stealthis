import {
  Author,
  DataProvider,
  LoadedPromptData,
  PromptPayload,
  PromptSummary,
  PromptVariable,
  Tag,
  Tool,
} from "@/data/contracts";
import { InformationSource, InformationSourceInput } from "@/types/dataSource";
import { localStorageService } from "@/services/localStorageService";

const AUTHORS_KEY = "pd_values_authors";
const TAGS_KEY = "pd_values_tags";
const TOOLS_KEY = "pd_values_tools";
const VARIABLES_KEY = "pd_values_global_variables";
const PROMPTS_KEY = "pd_prompts";
const SEED_VERSION_KEY = "pd_local_seed_version";
const SEED_VERSION = "2026-03-07-prompts-manager-v1";

interface LocalPromptRecord {
  id: number;
  metadata: PromptPayload["metadata"];
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
  if (typeof window === "undefined") return fallback;
  return parseJson<T>(localStorage.getItem(key), fallback);
};

const writeCollection = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

const nextId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

type PromptSeedTemplate = {
  id: number;
  title: string;
  description: string;
  version: string;
  authorName: string;
  tagNames: string[];
  variables: string[];
  sectionOrder?: string[];
  sections: Record<string, string>;
  tools: Record<string, boolean>;
  createdAtOffsetDays: number;
  updatedAtOffsetDays: number;
};

const DEFAULT_AUTHORS: Author[] = [
  { id: 1, name: "System", email: "", team: "Core" },
  { id: 2, name: "Camila Rojas", email: "camila@promptdesigner.local", team: "Growth" },
  { id: 3, name: "Diego Medina", email: "diego@promptdesigner.local", team: "Sales Ops" },
  { id: 4, name: "Laura Perez", email: "laura@promptdesigner.local", team: "Customer Success" },
];

const DEFAULT_TAGS: Tag[] = [
  { id: 11, name: "tools" },
  { id: 12, name: "onboarding" },
  { id: 13, name: "sales" },
  { id: 14, name: "support" },
  { id: 15, name: "quality" },
  { id: 16, name: "escalation" },
  { id: 17, name: "retention" },
  { id: 18, name: "bilingual" },
];

const DEFAULT_TOOLS: Tool[] = [
  {
    id: 21,
    name: "call",
    description: "Llamadas de voz y seguimiento de conversaciones.",
  },
  {
    id: 22,
    name: "crm_search",
    description: "Consulta historial y contexto de cliente en CRM.",
  },
  {
    id: 23,
    name: "knowledge_base",
    description: "Busca respuestas aprobadas en la base de conocimiento.",
  },
  {
    id: 24,
    name: "calendar",
    description: "Agenda reuniones de seguimiento y recordatorios.",
  },
  {
    id: 25,
    name: "escalation_flow",
    description: "Activa protocolo de escalado para casos criticos.",
  },
];

const DEFAULT_GLOBAL_VARIABLES: PromptVariable[] = [
  {
    id: 31,
    prompt_id: null,
    variable_name: "company_name",
    variable_type: "Sistema",
    description: "Nombre de la compania usuaria.",
    is_required: true,
  },
  {
    id: 32,
    prompt_id: null,
    variable_name: "user_name",
    variable_type: "Sistema",
    description: "Nombre del usuario final.",
    is_required: true,
  },
  {
    id: 33,
    prompt_id: null,
    variable_name: "customer_tier",
    variable_type: "CRM",
    description: "Tier comercial del cliente.",
    is_required: false,
  },
  {
    id: 34,
    prompt_id: null,
    variable_name: "ticket_priority",
    variable_type: "Soporte",
    description: "Prioridad del ticket activo.",
    is_required: false,
  },
  {
    id: 35,
    prompt_id: null,
    variable_name: "preferred_language",
    variable_type: "Perfil",
    description: "Idioma preferido por el usuario.",
    is_required: false,
  },
];

const DEFAULT_PROMPT_TEMPLATES: PromptSeedTemplate[] = [
  {
    id: 1001,
    title: "Prompt Maestro SDR Inbound",
    description: "Califica leads entrantes, prioriza oportunidades y propone siguiente accion.",
    version: "1.2.0",
    authorName: "Camila Rojas",
    tagNames: ["tools", "onboarding", "sales"],
    variables: ["company_name", "user_name", "customer_tier"],
    sections: {
      identity_role: `Eres un SDR senior enfocado en conversion para ${"{{company_name}}"}.\nResponde siempre en tono consultivo y directo.\nAdapta el lenguaje al perfil del lead.`,
      steps_objectives: `1. Resume el contexto del lead en una frase.\n2. Evalua fit comercial (bajo/medio/alto) con justificacion.\n3. Define la siguiente accion concreta en menos de 24h.\n4. Si el fit es alto, agenda llamada con CTA claro.`,
      available_tools: `- call: usar cuando el lead solicita contacto inmediato.\n- crm_search: validar industria, tamano de empresa y ciclo previo.\n- calendar: reservar llamada y confirmar zona horaria.\n- knowledge_base: responder dudas de pricing y onboarding.`,
    },
    tools: {
      call: true,
      crm_search: true,
      calendar: true,
      knowledge_base: true,
      escalation_flow: false,
    },
    createdAtOffsetDays: 14,
    updatedAtOffsetDays: 2,
  },
  {
    id: 1002,
    title: "Soporte L2 con Escalacion",
    description: "Guia para soporte tecnico de segundo nivel con criterios de escalado.",
    version: "2.0.1",
    authorName: "Laura Perez",
    tagNames: ["tools", "support", "escalation"],
    variables: ["user_name", "ticket_priority", "preferred_language"],
    sections: {
      identity_role: `Eres especialista L2. Atiendes al usuario ${"{{user_name}}"} en su idioma preferido (${"{{preferred_language}}"}).\nDebes mantener trazabilidad tecnica en cada respuesta.`,
      steps_objectives: `1. Reproducir el problema y confirmar impacto.\n2. Entregar workaround temporal si aplica.\n3. Escalar a ingenieria cuando prioridad sea alta o bloqueante.\n4. Cerrar con checklist de verificacion para el usuario.`,
      available_tools: `- knowledge_base: confirmar workaround oficial.\n- escalation_flow: abrir incidente y adjuntar evidencia.\n- crm_search: revisar historial de tickets relacionados.\n- call: habilitar llamada solo en incidentes criticos.`,
    },
    tools: {
      call: true,
      crm_search: true,
      calendar: false,
      knowledge_base: true,
      escalation_flow: true,
    },
    createdAtOffsetDays: 10,
    updatedAtOffsetDays: 1,
  },
  {
    id: 1003,
    title: "Renovaciones B2B Trimestrales",
    description: "Estructura de renovacion para cuentas con riesgo medio/alto.",
    version: "1.1.3",
    authorName: "Diego Medina",
    tagNames: ["tools", "retention", "sales"],
    variables: ["company_name", "customer_tier"],
    sections: {
      identity_role: `Eres account manager de renovaciones para ${"{{company_name}}"}.\nTu objetivo es proteger ARR y reducir churn.`,
      steps_objectives: `1. Detectar senales de riesgo con datos de uso.\n2. Proponer plan de valor para el tier ${"{{customer_tier}}"}.\n3. Negociar terminos sin comprometer margen minimo.\n4. Documentar resultado y proxima revision en 30 dias.`,
      available_tools: `- crm_search: revisar health score, NPS y renovaciones previas.\n- calendar: coordinar QBR con decisores.\n- call: ejecutar discovery de riesgo.\n- knowledge_base: compartir casos de uso comparables.`,
    },
    tools: {
      call: true,
      crm_search: true,
      calendar: true,
      knowledge_base: true,
      escalation_flow: false,
    },
    createdAtOffsetDays: 8,
    updatedAtOffsetDays: 3,
  },
  {
    id: 1004,
    title: "Onboarding Producto Self-Serve",
    description: "Flujo guiado para activar usuarios nuevos durante los primeros 7 dias.",
    version: "0.9.8",
    authorName: "System",
    tagNames: ["tools", "onboarding", "quality"],
    variables: ["user_name", "preferred_language"],
    sections: {
      identity_role: `Eres especialista de activacion de producto.\nAcompanas a ${"{{user_name}}"} para alcanzar su primer valor en una semana.`,
      steps_objectives: `1. Explicar el objetivo principal del producto en lenguaje simple.\n2. Recomendar 3 acciones iniciales por orden de impacto.\n3. Detectar bloqueos y enrutar soporte si es necesario.\n4. Finalizar con resumen de progreso y siguiente milestone.`,
      available_tools: `- knowledge_base: enviar guias paso a paso.\n- call: solo cuando el usuario reporta bloqueo total.\n- crm_search: validar segmento y plan.\n- calendar: programar check-in de activacion.`,
    },
    tools: {
      call: true,
      crm_search: true,
      calendar: true,
      knowledge_base: true,
      escalation_flow: false,
    },
    createdAtOffsetDays: 6,
    updatedAtOffsetDays: 4,
  },
];

const seedDate = (daysAgo: number): string =>
  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

const ensureLocalSeedData = (): void => {
  if (typeof window === "undefined") return;

  const seededVersion = localStorage.getItem(SEED_VERSION_KEY);
  if (seededVersion === SEED_VERSION) {
    return;
  }

  let authors = readCollection<Author[]>(AUTHORS_KEY, []);
  if (authors.length === 0) {
    authors = DEFAULT_AUTHORS;
    writeCollection(AUTHORS_KEY, authors);
  }

  let tags = readCollection<Tag[]>(TAGS_KEY, []);
  if (tags.length === 0) {
    tags = DEFAULT_TAGS;
    writeCollection(TAGS_KEY, tags);
  }

  let tools = readCollection<Tool[]>(TOOLS_KEY, []);
  if (tools.length === 0) {
    tools = DEFAULT_TOOLS;
    writeCollection(TOOLS_KEY, tools);
  }

  let variables = readCollection<PromptVariable[]>(VARIABLES_KEY, []);
  if (variables.length === 0) {
    variables = DEFAULT_GLOBAL_VARIABLES;
    writeCollection(VARIABLES_KEY, variables);
  }

  const prompts = readCollection<LocalPromptRecord[]>(PROMPTS_KEY, []);
  if (prompts.length === 0) {
    const authorIdByName = new Map(authors.map((author) => [author.name, author.id]));
    const tagIdByName = new Map(tags.map((tag) => [tag.name, tag.id]));
    const fallbackAuthorId = authors[0]?.id ?? null;
    const fallbackTagIds = tags.slice(0, 2).map((tag) => tag.id);

    const seededPrompts = DEFAULT_PROMPT_TEMPLATES.map((template) => {
      const tagIds = template.tagNames
        .map((tagName) => tagIdByName.get(tagName))
        .filter((tagId): tagId is number => typeof tagId === "number");

      const createdAt = seedDate(template.createdAtOffsetDays);
      const updatedAt = seedDate(template.updatedAtOffsetDays);

      return {
        id: template.id,
        metadata: {
          version: template.version,
          author: template.authorName,
          lastModified: updatedAt,
          title: template.title,
          description: template.description,
          tags: template.tagNames,
        },
        sections: template.sections,
        sectionOrder: template.sectionOrder || [],
        tools: template.tools,
        variables: template.variables,
        author_id: authorIdByName.get(template.authorName) ?? fallbackAuthorId,
        tag_ids: tagIds.length > 0 ? tagIds : fallbackTagIds,
        created_at: createdAt,
        updated_at: updatedAt,
      } satisfies LocalPromptRecord;
    });

    writeCollection(PROMPTS_KEY, seededPrompts);
  }

  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
};

const getAuthorsStore = (): Author[] => {
  ensureLocalSeedData();
  return readCollection<Author[]>(AUTHORS_KEY, []);
};
const saveAuthorsStore = (authors: Author[]) => writeCollection(AUTHORS_KEY, authors);

const getTagsStore = (): Tag[] => {
  ensureLocalSeedData();
  return readCollection<Tag[]>(TAGS_KEY, []);
};
const saveTagsStore = (tags: Tag[]) => writeCollection(TAGS_KEY, tags);

const getToolsStore = (): Tool[] => {
  ensureLocalSeedData();
  return readCollection<Tool[]>(TOOLS_KEY, []);
};
const saveToolsStore = (tools: Tool[]) => writeCollection(TOOLS_KEY, tools);

const getVariablesStore = (): PromptVariable[] => {
  ensureLocalSeedData();
  return readCollection<PromptVariable[]>(VARIABLES_KEY, []);
};
const saveVariablesStore = (variables: PromptVariable[]) =>
  writeCollection(VARIABLES_KEY, variables);

const getPromptsStore = (): LocalPromptRecord[] => {
  ensureLocalSeedData();
  return readCollection<LocalPromptRecord[]>(PROMPTS_KEY, []);
};
const savePromptsStore = (prompts: LocalPromptRecord[]) => writeCollection(PROMPTS_KEY, prompts);

const findOrCreateAuthorByName = (name: string): Author => {
  const trimmed = name.trim() || "Unknown";
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
  kind: "local",
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
            title: p.metadata.title || "Prompt sin titulo",
            description: p.metadata.description || null,
            version: p.metadata.version || "0.0.0",
            author_name: author?.name ?? p.metadata.author ?? null,
            author_team: author?.team ?? null,
            tags: tagNames,
            created_at: p.created_at,
            updated_at: p.updated_at,
            variable_count: p.variables.length,
          } as PromptSummary;
        })
        .sort(
          (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
        );
    },

    async loadPrompt(promptId: number): Promise<LoadedPromptData> {
      const prompt = getPromptsStore().find((p) => p.id === promptId);
      if (!prompt) {
        throw new Error("Prompt no encontrado en almacenamiento local");
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
      tagIds: number[] = []
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
      if (idx === -1) throw new Error("Autor no encontrado");
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
      if (idx === -1) throw new Error("Tool no encontrado");
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
        variable_type: variable.variable_type || "text",
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
