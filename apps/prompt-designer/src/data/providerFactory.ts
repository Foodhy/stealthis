import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { DataProvider } from '@/data/contracts';
import { localDataProvider } from '@/data/providers/localProvider';
import { supabaseDataProvider } from '@/data/providers/supabaseProvider';

export type ProviderMode = 'auto' | 'local' | 'supabase';

const getRequestedMode = (): ProviderMode => {
  const raw = (import.meta.env.VITE_DATA_PROVIDER || 'auto').toLowerCase();
  if (raw === 'local' || raw === 'supabase' || raw === 'auto') return raw;
  return 'auto';
};

const resolveProvider = (): DataProvider => {
  const mode = getRequestedMode();

  if (mode === 'local') return localDataProvider;
  if (mode === 'supabase') {
    if (!isSupabaseConfigured) {
      console.warn('[data-provider] VITE_DATA_PROVIDER=supabase but credentials are missing. Falling back to local provider.');
      return localDataProvider;
    }
    return supabaseDataProvider;
  }

  return isSupabaseConfigured ? supabaseDataProvider : localDataProvider;
};

let providerSingleton: DataProvider | null = null;

export const getDataProvider = (): DataProvider => {
  if (!providerSingleton) {
    providerSingleton = resolveProvider();
    console.info(`[data-provider] active provider: ${providerSingleton.kind}`);
  }
  return providerSingleton;
};

export const getActiveDataProviderKind = (): DataProvider['kind'] => {
  return getDataProvider().kind;
};
