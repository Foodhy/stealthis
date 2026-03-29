import { HttpMethod, Header } from "@/hooks/useApiTester";

export interface ApiConfiguration {
  id: string;
  url: string;
  method: HttpMethod;
  headers: Header[];
  body: string;
  savedAt: string;
}

const STORAGE_KEY = "api_tester_configurations";

/**
 * Normalize configuration for comparison (remove empty headers, trim values)
 */
function normalizeConfig(config: {
  url: string;
  method: HttpMethod;
  headers: Header[];
  body: string;
}): string {
  const normalized = {
    url: config.url.trim(),
    method: config.method,
    headers: config.headers
      .filter((h) => h.key.trim())
      .map((h) => ({ key: h.key.trim(), value: h.value.trim() }))
      .sort((a, b) => a.key.localeCompare(b.key)),
    body: config.body.trim(),
  };
  return JSON.stringify(normalized);
}

/**
 * Get all saved configurations from localStorage
 */
function getConfigurations(): ApiConfiguration[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save configurations to localStorage
 */
function saveConfigurations(configs: ApiConfiguration[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

/**
 * Compare two configurations to check if they are the same
 */
function isSameConfiguration(
  config1: { url: string; method: HttpMethod; headers: Header[]; body: string },
  config2: { url: string; method: HttpMethod; headers: Header[]; body: string }
): boolean {
  return normalizeConfig(config1) === normalizeConfig(config2);
}

export const apiConfigService = {
  /**
   * Save a configuration if it's different from the last one
   */
  saveConfiguration: (config: {
    url: string;
    method: HttpMethod;
    headers: Header[];
    body: string;
  }): void => {
    const configs = getConfigurations();
    const lastConfig = configs[0]; // Most recent is first

    // Only save if different from last configuration
    if (!lastConfig || !isSameConfiguration(config, lastConfig)) {
      const newConfig: ApiConfiguration = {
        id: Date.now().toString(),
        url: config.url,
        method: config.method,
        headers: config.headers,
        body: config.body,
        savedAt: new Date().toISOString(),
      };
      // Add to beginning of array (most recent first)
      saveConfigurations([newConfig, ...configs]);
    }
  },

  /**
   * Get all saved configurations
   */
  getAll: (): ApiConfiguration[] => {
    return getConfigurations();
  },

  /**
   * Get the last saved configuration
   */
  getLast: (): ApiConfiguration | null => {
    const configs = getConfigurations();
    return configs.length > 0 ? configs[0] : null;
  },

  /**
   * Delete a specific configuration by ID
   */
  deleteById: (id: string): void => {
    const configs = getConfigurations();
    const filtered = configs.filter((c) => c.id !== id);
    saveConfigurations(filtered);
  },

  /**
   * Get a configuration by ID
   */
  getById: (id: string): ApiConfiguration | null => {
    const configs = getConfigurations();
    return configs.find((c) => c.id === id) || null;
  },

  /**
   * Clear all saved configurations
   */
  clearAll: (): void => {
    saveConfigurations([]);
  },
};
