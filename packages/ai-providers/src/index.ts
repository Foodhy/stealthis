// Cliente de proveedores de IA compartido por las apps del monorepo.
// Sin dependencias de UI: solo fetch, tipos y persistencia.

export type {
  AiModel,
  AiProvider,
  AiProviderConfig,
  ChatMessage,
  ChatOptions,
} from "./client";
export { PROVIDER_DEFAULTS, chat, listModels } from "./client";

export type { StorageOptions, StoredConfig } from "./storage";
export {
  CONFIG_VERSION,
  defaultConfig,
  loadProviderConfig,
  saveProviderConfig,
} from "./storage";
