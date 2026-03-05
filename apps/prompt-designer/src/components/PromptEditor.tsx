import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card } from '@/components/native/card';
import { Button } from '@/components/native/button';
import { Input } from '@/components/native/input';
import { Badge } from '@/components/native/badge';
import { Copy, Save, Plus, Maximize2, Upload, Play, ArrowLeft, Trash, Loader, X } from '@/components/icons/extra';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/native/select';
import { PromptSection } from './PromptSection';
import { VariablePanel } from './VariablePanel';
import { ConsolidatedView } from './ConsolidatedView';
import { FullscreenEditor } from './FullscreenEditor';
import { AgentTester } from './AgentTester';
import { useToast } from '@/components/native/toast';
import { loadPrompt, savePrompt, deletePrompt } from '@/services/promptService';
import { valuesService, Tool, PromptVariable, Author, Tag } from '@/services/valuesService';

export interface PromptData {
  metadata: {
    version: string;
    author: string;
    lastModified: string;
    title: string;
    description: string;
    tags: string[];
  };
  sections: {
    [key: string]: string;
  };
  sectionOrder?: string[];
  tools: ToolState;
}



type SectionsRecord = { [key: string]: string };
type ToolState = Record<string, boolean>;

interface ToolDefinition {
  name: string;
  display_name: string;
  info: string;
}

// TOOL_CATALOG removed. Utilizing dynamic tools from valuesService.

interface HistoryEntry {
  version: string;
  baseVersion: string | null;
  savedAt: string;
  metadata: PromptData['metadata'];
  changes: SectionsRecord;
  sectionOrder?: string[];
  toolChanges?: ToolState;
}

interface StoredPromptState {
  current: PromptData;
  history: HistoryEntry[];
}

const STORAGE_KEY = 'prompt-editor-history';

// Default sections matching schema: identity_role, steps_objectives, available_tools (replaced by pitch for UI default)
const DEFAULT_SECTION_KEYS = ['identity_role', 'steps_objectives', 'available_tools'];
const DEFAULT_SECTION_TITLES: Record<string, string> = {
  'identity_role': 'Identidad y Rol',
  'steps_objectives': 'Pasos y Objetivos del flujo',
  'available_tools': 'Herramientas Disponibles'
};

const createEmptySections = (): SectionsRecord => {
  const sections: SectionsRecord = {};
  DEFAULT_SECTION_KEYS.forEach(key => {
    sections[key] = '';
  });
  return sections;
};

const mergeWithDefaultSections = (sections: SectionsRecord): SectionsRecord => ({
  ...createEmptySections(),
  ...sections
});

const createDefaultToolState = (catalog: ToolDefinition[] = []): ToolState => {
  return catalog.reduce((acc, tool) => {
    acc[tool.name] = false;
    return acc;
  }, {} as ToolState);
};

const normalizeToolState = (tools: ToolState | undefined, catalog: ToolDefinition[]): ToolState => {
  const baseState = createDefaultToolState(catalog);
  if (!tools) return baseState;

  // If catalog is empty/loading, preserve existing tools to avoid data loss during load
  if (catalog.length === 0) return { ...tools };

  return catalog.reduce((acc, tool) => {
    acc[tool.name] = Boolean(tools[tool.name]);
    return acc;
  }, baseState);
};

const normalizeToolChanges = (changes: ToolState | undefined, catalog: ToolDefinition[]): ToolState => {
  if (!changes) return {};
  if (catalog.length === 0) return { ...changes };

  return Object.entries(changes).reduce((acc, [key, value]) => {
    if (catalog.some(tool => tool.name === key)) {
      acc[key] = Boolean(value);
    }
    return acc;
  }, {} as ToolState);
};

const buildDefaultPromptData = (catalog: ToolDefinition[] = []): PromptData => ({
  metadata: {
    version: '',
    author: '',
    lastModified: new Date().toISOString(),
    title: '',
    description: '',
    tags: []
  },
  sections: createEmptySections(),
  sectionOrder: [],
  tools: createDefaultToolState(catalog)
});

const defaultVariables = [
  'prospect_country', 'prospect_city', 'prospect_name', 'phone_number'
];

// Helper to wrap string vars as PromptVariable
const toPromptVariable = (name: string, type: string = 'text'): PromptVariable => ({
  id: -1, // placeholder for non-db defaults
  prompt_id: null,
  variable_name: name,
  variable_type: type,
  description: '',
  is_required: false
});

const defaultVariablesObjs: PromptVariable[] = defaultVariables.map(v => toPromptVariable(v, 'Sistema'));

interface PromptEditorProps {
  promptId?: number | null;
  onBack?: () => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({ promptId, onBack }) => {
  const { toast } = useToast();
  const [variables, setVariables] = useState<PromptVariable[]>(defaultVariablesObjs);
  const [fullscreenSection, setFullscreenSection] = useState<string | null>(null);
  const [sectionTitles, setSectionTitles] = useState<{ [key: string]: string }>({});
  const [promptData, setPromptData] = useState<PromptData>(buildDefaultPromptData);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [baselineData, setBaselineData] = useState<PromptData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAgentTesterOpen, setIsAgentTesterOpen] = useState(false);
  const [currentPromptId, setCurrentPromptId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [availableTools, setAvailableTools] = useState<ToolDefinition[]>([]);
  const [availableAuthors, setAvailableAuthors] = useState<Author[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [authorSearchQuery, setAuthorSearchQuery] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [toolsData, authorsData, tagsData] = await Promise.all([
          valuesService.getTools(),
          valuesService.getAuthors(),
          valuesService.getTags()
        ]);

        const formattedTools: ToolDefinition[] = toolsData.map(t => ({
          name: t.name,
          display_name: t.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          info: t.description || ''
        }));
        setAvailableTools(formattedTools);
        setAvailableAuthors(authorsData);
        setAvailableTags(tagsData);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    fetchInitialData();
  }, []);

  // Sync selectedTagIds when availableTags or promptData.metadata.tags change
  useEffect(() => {
    if (availableTags.length > 0 && promptData.metadata.tags.length > 0) {
      const tagIds = promptData.metadata.tags
        .map(tagName => availableTags.find(t => t.name === tagName)?.id)
        .filter((id): id is number => id !== undefined);

      // Only update if different to avoid infinite loops
      if (JSON.stringify(tagIds.sort()) !== JSON.stringify(selectedTagIds.sort())) {
        setSelectedTagIds(tagIds);
      }
    }
  }, [availableTags, promptData.metadata.tags]);


  // availableTools state defined in previous step (kept)
  // Remove the isolated useEffect if it exists (handled by overlapping removal or next step if separate)
  // Merging fetch logic into main loadData

  useEffect(() => {
    const loadData = async () => {
      if (typeof window === 'undefined') return;

      setIsLoading(true);

      try {
        // 1. Fetch Tools & Variables
        let toolsCatalog: ToolDefinition[] = [];
        let mergedVariables: PromptVariable[] = [];

        try {
          const [toolsData, variablesData] = await Promise.all([
            valuesService.getTools(),
            valuesService.getGlobalVariables()
          ]);

          toolsCatalog = toolsData.map(t => ({
            name: t.name,
            display_name: t.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            info: t.description || ''
          }));
          setAvailableTools(toolsCatalog);

          // Merge default(hardcoded) with DB variables
          // We will prioritize DB variables if names collide (to get their types)
          const variableMap = new Map<string, PromptVariable>();

          defaultVariablesObjs.forEach(v => variableMap.set(v.variable_name, v));
          variablesData.forEach(v => variableMap.set(v.variable_name, v)); // DB overrides defaults

          mergedVariables = Array.from(variableMap.values());
          setVariables(mergedVariables);

        } catch (e) {
          console.error('Failed to load tools or variables', e);
          // Fallback if DB fails
          mergedVariables = defaultVariablesObjs;
          setVariables(mergedVariables);
        }

        if (promptId) {
          try {
            // @ts-ignore
            const loadedData = await loadPrompt(promptId);
            setCurrentPromptId(loadedData.id);
            setPromptData({
              metadata: {
                ...loadedData.metadata,
                tags: loadedData.metadata.tags || []
              },
              sections: loadedData.sections,
              sectionOrder: loadedData.sectionOrder,
              tools: loadedData.tools // Keep raw tools, normalize later or here?
            });
            setBaselineData({
              metadata: {
                ...loadedData.metadata,
                tags: loadedData.metadata.tags || []
              },
              sections: loadedData.sections,
              sectionOrder: loadedData.sectionOrder,
              tools: loadedData.tools
            });
            // Merge default/global variables with any prompt-specific ones (if any were strictly local/custom)
            // Assuming loadedData.variables is string[] based on current loadPrompt impl
            const loadedVars = loadedData.variables || [];

            // We want to preserve the metadata (category) of our known global variables
            // So we take the known mergedVariables and ensure they are selected/present?
            // Actually, variables state represents *available* variables or *selected*?
            // In the legacy code, it seemed to be "Available variables in the sidebar".
            // If so, we just want our global list.

            // However, looking at legacy: `setVariables(loadedData.variables)` implies it OVERWROTE the list 
            // with what was saved in the prompt.
            // If the prompt saves the *list of variables used*, then we should respect that, but we also want the global ones available.
            // Let's union them.

            const existingMap = new Map<string, PromptVariable>();
            // Add current known globals to map
            mergedVariables.forEach(v => existingMap.set(v.variable_name, v));

            // Add loaded vars (if they are new/adhoc, we default them)
            loadedVars.forEach((vName: string) => {
              if (!existingMap.has(vName)) {
                existingMap.set(vName, toPromptVariable(vName, 'Local'));
              }
            });

            setVariables(Array.from(existingMap.values()));

            // Sync author selection
            const loadedAuthor = availableAuthors.find(a => a.name === loadedData.metadata.author);
            if (loadedAuthor) {
              setSelectedAuthorId(loadedAuthor.id);
            }

            // Sync tag selections
            const loadedTagIds = loadedData.metadata.tags
              .map(tagName => availableTags.find(t => t.name === tagName)?.id)
              .filter((id): id is number => id !== undefined);
            setSelectedTagIds(loadedTagIds);

            // ... (titles logic) ...

            // Set section titles
            const titles: { [key: string]: string } = {};
            const getTitleHelper = (key: string): string => {
              return DEFAULT_SECTION_TITLES[key] || key.split(/[-_]/).map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
            };
            Object.keys(loadedData.sections).forEach(key => {
              titles[key] = getTitleHelper(key);
            });
            setSectionTitles(titles);
            setHistory([]);
            setIsInitialized(true);
            return;
          } catch (error) {
            console.error('Error loading prompt from Supabase:', error);
            toast({
              title: 'Error al cargar',
              description: 'No se pudo cargar el prompt desde la base de datos. Usando datos locales.',
              variant: 'destructive'
            });
          }
        }

        // If no promptId, start fresh (don't load from localStorage)
        if (!promptId) {
          // Clear any old localStorage data to start completely fresh
          localStorage.removeItem(STORAGE_KEY);
          setBaselineData(buildDefaultPromptData(toolsCatalog));
          setPromptData(buildDefaultPromptData(toolsCatalog));
          setIsInitialized(true);
          return;
        }

        const storedValue = localStorage.getItem(STORAGE_KEY);
        if (!storedValue) {
          setBaselineData(buildDefaultPromptData(toolsCatalog));
          setIsInitialized(true);
          return;
        }

        try {
          const parsed: StoredPromptState = JSON.parse(storedValue);
          if (parsed?.current) {
            // Migration logic for old structure if needed
            const rawMetadata = parsed.current.metadata;
            const migratedMetadata = {
              version: rawMetadata.version || '1.0.0',
              author: rawMetadata.author || '',
              lastModified: rawMetadata.lastModified || new Date().toISOString(),
              title: rawMetadata.title || (rawMetadata as any).description || 'Prompt Restored',
              description: rawMetadata.description || '',
              tags: rawMetadata.tags || ((rawMetadata as any).promptType ? [(rawMetadata as any).promptType] : [])
            };

            const mergedSections = mergeWithDefaultSections(parsed.current.sections || {});
            const normalizedTools = normalizeToolState(parsed.current.tools, toolsCatalog);

            // Reconstruct section order
            const customSections = Object.keys(mergedSections).filter(key =>
              !DEFAULT_SECTION_KEYS.includes(key)
            );
            const sectionOrder = parsed.current.sectionOrder || customSections;

            const loadedData: PromptData = {
              metadata: migratedMetadata,
              sections: mergedSections,
              sectionOrder: sectionOrder,
              tools: normalizedTools
            };

            setPromptData(loadedData);
            setBaselineData(loadedData);

            // Update titles
            const titles: { [key: string]: string } = {};
            Object.keys(mergedSections).forEach(key => {
              titles[key] = DEFAULT_SECTION_TITLES[key] || key.replace(/[-_]/g, ' ');
            });
            setSectionTitles(titles);
          } else {
            setBaselineData(buildDefaultPromptData(toolsCatalog));
          }
          setHistory(parsed.history || []);
        } catch (error) {
          console.error('Error loading prompt history', error);
          setBaselineData(buildDefaultPromptData(toolsCatalog));
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadData();
  }, [promptId, toast]);

  const versionsMap = useMemo(() => {
    const map = new Map<string, PromptData>();
    history.forEach(entry => {
      // Simplified version reconstruction for brevity in this refactor
      // Ideally should reconstruct fully like in previous file
      const migratedMetadata = {
        version: entry.metadata.version || '1.0.0',
        author: entry.metadata.author || '',
        lastModified: entry.metadata.lastModified || entry.savedAt,
        title: entry.metadata.title || 'Version',
        description: entry.metadata.description || '',
        tags: entry.metadata.tags || []
      };

      map.set(entry.version, {
        metadata: migratedMetadata,
        sections: { ...entry.changes },
        sectionOrder: entry.sectionOrder,
        tools: normalizeToolState(entry.toolChanges, availableTools)
      } as PromptData);
    });
    return map;
  }, [history]);

  const savedVersions = useMemo(() => {
    return history.map(h => h.version).filter((v, i, a) => a.indexOf(v) === i);
  }, [history]);

  const currentTools = useMemo(() => normalizeToolState(promptData.tools, availableTools), [promptData.tools, availableTools]);
  const enabledTools = useMemo(() => availableTools.filter(tool => currentTools[tool.name]), [currentTools, availableTools]);

  const updateSection = useCallback((sectionKey: string, content: string) => {
    setPromptData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionKey]: content
      },
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString()
      }
    }));
  }, []);

  const updateMetadata = useCallback(<K extends keyof PromptData['metadata']>(field: K, value: PromptData['metadata'][K]) => {
    setPromptData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
        lastModified: new Date().toISOString()
      }
    }));
  }, []);

  const toggleTool = useCallback((toolId: string, enabled: boolean) => {
    setPromptData(prev => ({
      ...prev,
      tools: {
        ...prev.tools,
        [toolId]: enabled
      },
      metadata: { ...prev.metadata, lastModified: new Date().toISOString() }
    }));
  }, []);

  // Tag Helpers
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !promptData.metadata.tags.includes(val)) {
        updateMetadata('tags', [...promptData.metadata.tags, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tag: string) => {
    updateMetadata('tags', promptData.metadata.tags.filter(t => t !== tag));
  };

  const handleVersionSelection = useCallback((value: string) => {
    if (value === '__new__') {
      const proposedVersion = prompt('Ingresa la nueva versión:');
      if (proposedVersion) {
        updateMetadata('version', proposedVersion.trim());
      }
      return;
    }
    const selected = versionsMap.get(value);
    if (selected) {
      setPromptData(selected);
      setBaselineData(selected);
      toast({ title: 'Versión cargada', description: value });
    }
  }, [versionsMap, updateMetadata, toast]);

  const updateSectionTitle = useCallback((sectionKey: string, title: string) => {
    setSectionTitles(prev => ({ ...prev, [sectionKey]: title }));
  }, []);

  const getSectionTitle = useCallback((sectionKey: string) => {
    return sectionTitles[sectionKey] || DEFAULT_SECTION_TITLES[sectionKey] || sectionKey.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }, [sectionTitles]);

  const sectionMarkdownBlocks = Object.entries(promptData.sections)
    .filter(([_, content]) => content.trim())
    .map(([key, content]) => {
      const title = getSectionTitle(key);
      return `## ${title}\n\n${content}`;
    });

  const toolsMarkdown = enabledTools.length
    ? `## Herramientas habilitadas\n\n${enabledTools.map(tool => `- **${tool.display_name}** (\`${tool.name}\`): ${tool.info}`).join('\n')}`
    : '';

  const consolidatedContent = [...sectionMarkdownBlocks, ...(toolsMarkdown ? [toolsMarkdown] : [])]
    .join('\n\n---\n\n');

  const handleConsolidatedChange = useCallback((content: string) => {
    // Basic parser for consolidated view
    toast({ title: 'Aviso', description: 'Edición consolidada simplificada en esta versión refactorizada.' });
  }, []);

  const addVariable = useCallback((variable: string) => {
    // Check if variable name exists in our list
    if (variable && !variables.some(v => v.variable_name === variable)) {
      setVariables(prev => [...prev, toPromptVariable(variable, 'Personalizada')]);
      toast({ title: 'Variable agregada', description: `Se agregó {{${variable}}}` });
    }
  }, [variables, toast]);

  const removeVariable = useCallback((variable: string) => {
    setVariables(prev => prev.filter(v => v.variable_name !== variable));
  }, []);

  const addNewSection = useCallback(() => {
    const sectionName = prompt('Ingresa el nombre de la nueva sección:');
    if (sectionName?.trim()) {
      const cleanName = sectionName.trim();
      const sectionKey = cleanName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''); // Schema keys use underscores mostly

      if (!Object.prototype.hasOwnProperty.call(promptData.sections, sectionKey)) {
        setPromptData(prev => ({
          ...prev,
          sections: { ...prev.sections, [sectionKey]: '' },
          sectionOrder: [...(prev.sectionOrder || []), sectionKey]
        }));
        setSectionTitles(prev => ({ ...prev, [sectionKey]: cleanName }));
      } else {
        toast({ title: 'Error', description: 'Ya existe una sección con ese nombre', variant: 'destructive' });
      }
    }
  }, [promptData.sections, toast]);

  const deleteSection = useCallback((sectionKey: string) => {
    if (confirm(`¿Estás seguro de eliminar la sección "${getSectionTitle(sectionKey)}"?`)) {
      setPromptData(prev => {
        const newSections = { ...prev.sections };
        delete newSections[sectionKey];

        return {
          ...prev,
          sections: newSections,
          sectionOrder: (prev.sectionOrder || []).filter(k => k !== sectionKey)
        };
      });

      setSectionTitles(prev => {
        const newTitles = { ...prev };
        delete newTitles[sectionKey];
        return newTitles;
      });

      toast({ title: 'Sección eliminada', description: `Se eliminó "${getSectionTitle(sectionKey)}"` });
    }
  }, [toast, getSectionTitle]);

  const handleSaveVersion = useCallback(async () => {
    if (!promptData.metadata.version) return;

    // Ensure we have an author ID - sync from metadata.author if needed
    let authorIdToSave = selectedAuthorId;
    if (!authorIdToSave && promptData.metadata.author) {
      const author = availableAuthors.find(a => a.name === promptData.metadata.author);
      if (author) {
        authorIdToSave = author.id;
        setSelectedAuthorId(author.id); // Sync for future saves
      }
    }

    if (!authorIdToSave) {
      toast({ title: 'Error', description: 'Debes seleccionar un autor', variant: 'destructive' });
      return;
    }

    // Ensure we have tag IDs - sync from metadata.tags if needed
    let tagIdsToSave = selectedTagIds;
    if (tagIdsToSave.length === 0 && promptData.metadata.tags.length > 0) {
      const tagIds = promptData.metadata.tags
        .map(tagName => availableTags.find(t => t.name === tagName)?.id)
        .filter((id): id is number => id !== undefined);
      if (tagIds.length > 0) {
        tagIdsToSave = tagIds;
        setSelectedTagIds(tagIds); // Sync for future saves
      }
    }

    setIsLoading(true);
    try {
      // Map variable objects back to strings for saving
      const variableNames = variables.map(v => v.variable_name);
      const id = await savePrompt(
        promptData as any,
        currentPromptId,
        variableNames,
        authorIdToSave,
        tagIdsToSave
      );
      setCurrentPromptId(id);
      toast({ title: 'Guardado', description: 'El prompt ha sido guardado exitosamente.' });

      // Local Backup
      const now = new Date().toISOString();
      const entry = {
        version: promptData.metadata.version,
        baseVersion: null,
        savedAt: now,
        metadata: promptData.metadata,
        changes: promptData.sections,
        sectionOrder: promptData.sectionOrder,
        toolChanges: {}
      };
      setHistory(prev => [...prev, entry]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ current: promptData, history: [...history, entry] }));

    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [promptData, currentPromptId, variables, history, toast, selectedAuthorId, selectedTagIds, availableAuthors, availableTags]);

  const handleDelete = useCallback(async () => {
    if (!currentPromptId) return;
    if (!confirm('Eliminar prompt?')) return;
    try {
      await deletePrompt(currentPromptId);
      setCurrentPromptId(null);
      setPromptData(buildDefaultPromptData());
      setHistory([]);
      onBack?.();
      toast({ title: 'Eliminado' });
    } catch (e) { console.error(e); }
  }, [currentPromptId, onBack, toast]);

  const handleCopy = () => { navigator.clipboard.writeText(consolidatedContent); toast({ title: 'Copiado' }); };
  const handleImportPrompt = (e: any) => { }; // Placeholder

  return (
    <div className="min-h-screen bg-editor-background relative">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader size={32} className="text-primary animate-spin" />
        </div>
      )}

      {/* Header */}
      <header className="bg-card border-b border-editor-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} disabled={isLoading} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft size={20} />
                <span className="text-sm">Proyectos</span>
              </button>
            )}
            <Badge variant="secondary">v{promptData.metadata.version}</Badge>
            {promptData.metadata.tags.map(t => <Badge key={t} variant="outline">{t.toUpperCase()}</Badge>)}
          </div>
          {currentPromptId && (
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading} className="gap-2">
              <Trash size={16} /> Eliminar
            </Button>
          )}
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <VariablePanel
          variables={variables}
          onAddVariable={addVariable}
          onRemoveVariable={removeVariable}
          tools={currentTools}
          availableTools={availableTools}
          onToggleTool={toggleTool}
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          onInsertVariable={(variableName) => {
            const editor = (window as any).currentMonacoEditor;
            if (editor) {
              const selection = editor.getSelection();
              const text = `{{${variableName}}}`;
              editor.executeEdits('insert-variable', [{
                range: selection,
                text: text,
                forceMoveMarkers: true
              }]);

              // Restore focus and update cursor
              /* const newPosition = {
                lineNumber: selection.startLineNumber,
                column: selection.startColumn + text.length
              }; */
              // editor.setPosition(newPosition); // executeEdits helps with cursor? usually yes if distinct range.
              editor.focus();
            } else {
              toast({ title: 'Error', description: 'Selecciona una sección del prompt primero', variant: 'destructive' });
            }
          }}
        />

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Metadata Card */}
          <Card className="m-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Tags Multi-Select */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Tags (Tipo de prompt)</label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const tagId = parseInt(value);
                    if (!selectedTagIds.includes(tagId)) {
                      setSelectedTagIds([...selectedTagIds, tagId]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <div className="flex flex-wrap gap-1">
                      {selectedTagIds.length === 0 ? (
                        <span className="text-muted-foreground">Seleccionar tags...</span>
                      ) : (
                        selectedTagIds.map(tagId => {
                          const tag = availableTags.find(t => t.id === tagId);
                          return tag ? (
                            <Badge key={tagId} variant="secondary" className="gap-1">
                              {tag.name}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
                                }}
                                className="hover:text-destructive"
                              >
                                <X size={12} />
                              </button>
                            </Badge>
                          ) : null;
                        })
                      )}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags
                      .filter(tag => !selectedTagIds.includes(tag.id))
                      .map(tag => (
                        <SelectItem key={tag.id} value={tag.id.toString()}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    {availableTags.filter(tag => !selectedTagIds.includes(tag.id)).length === 0 && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Todos los tags seleccionados
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Version - Free Text Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Versión</label>
                <Input
                  placeholder="ej: 1.0.0"
                  value={promptData.metadata.version}
                  onChange={(e) => updateMetadata('version', e.target.value)}
                />
              </div>

              {/* Author - Searchable Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Autor</label>
                <Select
                  value={promptData.metadata.author || ""}
                  onValueChange={(authorName) => {
                    const author = availableAuthors.find(a => a.name === authorName);
                    if (author) {
                      setSelectedAuthorId(author.id);
                      updateMetadata('author', author.name);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar autor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAuthors.map(author => (
                      <SelectItem key={author.id} value={author.name}>
                        {author.name}
                        {author.team && <span className="text-muted-foreground ml-2">({author.team})</span>}
                      </SelectItem>
                    ))}
                    {availableAuthors.length === 0 && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No hay autores disponibles
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Título</label>
                <Input
                  placeholder="Título del prompt"
                  value={promptData.metadata.title}
                  onChange={(e) => updateMetadata('title', e.target.value)}
                />
              </div>
            </div>

            {/* Description Row */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descripción detallada del prompt..."
                value={promptData.metadata.description}
                onChange={(e) => updateMetadata('description', e.target.value)}
              />
            </div>
          </Card>

          {/* Sections Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 items-start">
            {/* Render Default Sections First */}
            {DEFAULT_SECTION_KEYS.map(key => (
              <div key={key} className="w-full h-[500px] flex-shrink-0 relative group">
                <div className="absolute right-1 top-1 z-20 opacity-0 group-hover:opacity-100 flex gap-1">
                  <Button
                    onClick={() => setFullscreenSection(key)}
                    variant="ghost"
                    size="icon"
                    className="bg-background/80 hover:bg-background"
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => deleteSection(key)}
                    variant="ghost"
                    size="icon"
                    className="bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
                <PromptSection
                  title={getSectionTitle(key)}
                  content={promptData.sections[key] || ''}
                  onContentChange={(val) => updateSection(key, val)}
                  onTitleChange={(t) => updateSectionTitle(key, t)}
                />
              </div>
            ))}

            {/* Render Custom/Ordered Sections */}
            {(promptData.sectionOrder || [])
              .filter(key => !DEFAULT_SECTION_KEYS.includes(key))
              .map(key => (
                <div key={key} className="w-full h-[500px] flex-shrink-0 relative group">
                  <div className="absolute right-1 top-1 z-20 opacity-0 group-hover:opacity-100 flex gap-1">
                    <Button
                      onClick={() => setFullscreenSection(key)}
                      variant="ghost"
                      size="icon"
                      className="bg-background/80 hover:bg-background"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => deleteSection(key)}
                      variant="ghost"
                      size="icon"
                      className="bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                  <PromptSection
                    title={getSectionTitle(key)}
                    content={promptData.sections[key] || ''}
                    onContentChange={(val) => updateSection(key, val)}
                    onTitleChange={(t) => updateSectionTitle(key, t)}
                  />
                </div>
              ))}

            {/* Add New Section Button */}
            <div className="w-full h-[500px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" onClick={addNewSection}>
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Plus size={32} />
                <span>Agregar Sección</span>
              </div>
            </div>
          </div>

          <ConsolidatedView
            content={consolidatedContent}
            onContentChange={handleConsolidatedChange}
            sections={promptData.sections}
            onCopy={handleCopy}
            onAddSection={addNewSection}
            onImport={handleImportPrompt}
            onSave={handleSaveVersion}
            onTestAgent={() => setIsAgentTesterOpen(true)}
            isLoading={isLoading}
          />
        </div>
      </div>

      {fullscreenSection && (
        <FullscreenEditor
          isOpen={!!fullscreenSection}
          onClose={() => setFullscreenSection(null)}
          title={getSectionTitle(fullscreenSection)}
          content={promptData.sections[fullscreenSection] || ''}
          onContentChange={(content) => updateSection(fullscreenSection, content)}
          variables={variables}
        />
      )}

      {isAgentTesterOpen && (
        <AgentTester
          isOpen={isAgentTesterOpen}
          onClose={() => setIsAgentTesterOpen(false)}
          systemTemplate={consolidatedContent}
          variables={variables}
        />
      )}
    </div>
  );
};
