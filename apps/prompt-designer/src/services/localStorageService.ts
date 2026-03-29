import { InformationSource, InformationSourceInput } from "@/types/dataSource";

const STORAGE_KEY = "information_sources";

const getSources = (): InformationSource[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveSources = (sources: InformationSource[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
};

export const localStorageService = {
  getAll: (): InformationSource[] => {
    return getSources().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getById: (id: number): InformationSource | undefined => {
    const sources = getSources();
    return sources.find((s) => s.id === id);
  },

  add: (input: InformationSourceInput): InformationSource => {
    const sources = getSources();
    const newSource: InformationSource = {
      ...input,
      id: Date.now(),
      author_id: 1, // Default user ID
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveSources([...sources, newSource]);
    return newSource;
  },

  delete: (id: number) => {
    const sources = getSources();
    const filtered = sources.filter((s) => s.id !== id);
    saveSources(filtered);
  },

  // Optional: Update functionality if needed later
  update: (id: number, updates: Partial<InformationSourceInput>) => {
    const sources = getSources();
    const updated = sources.map((s) =>
      s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
    );
    saveSources(updated);
  },
};
