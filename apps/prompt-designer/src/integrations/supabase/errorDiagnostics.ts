interface SupabaseErrorLike {
  code?: string;
  details?: string;
  hint?: string;
  message?: string;
  status?: number;
}

interface DiagnosticOptions {
  action: string;
  expectedObjects?: string[];
}

const asErrorLike = (error: unknown): SupabaseErrorLike => {
  if (error && typeof error === 'object') {
    return error as SupabaseErrorLike;
  }
  if (typeof error === 'string') {
    return { message: error };
  }
  return {};
};

const buildHaystack = (error: SupabaseErrorLike): string => {
  return [error.code, error.message, error.details, error.hint]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const includesAny = (value: string, terms: string[]): boolean => {
  return terms.some((term) => value.includes(term));
};

export const explainSupabaseError = (
  error: unknown,
  { action, expectedObjects = [] }: DiagnosticOptions,
): string => {
  const candidate = asErrorLike(error);
  const haystack = buildHaystack(candidate);
  const objectsHint = expectedObjects.length
    ? ` Objetos esperados: ${expectedObjects.join(', ')}.`
    : '';

  if (haystack.includes('supabase no esta configurado')) {
    return (
      candidate.message ||
      'Supabase no esta configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  if (
    includesAny(haystack, [
      'failed to fetch',
      'fetch failed',
      'networkerror',
      'network request failed',
      'load failed',
      'typeerror: failed to fetch',
    ])
  ) {
    return `No se pudo conectar con Supabase para ${action}. Revisa red, URL del proyecto y CORS.`;
  }

  if (
    includesAny(haystack, [
      'schema cache',
      'could not find the table',
      'could not find the function',
      'does not exist',
      'relation',
      '42p01',
      'pgrst202',
      'pgrst205',
    ])
  ) {
    return `Supabase responde, pero falta el esquema esperado para ${action}.${objectsHint} Ejecuta apps/prompt-designer/supabase/schema.sql o cambia VITE_DATA_PROVIDER=local mientras migras.`;
  }

  if (
    includesAny(haystack, [
      'permission denied',
      'row-level security',
      'rls',
      'invalid api key',
      'invalid jwt',
      'jwt',
      '401',
      '403',
    ])
  ) {
    return `Supabase respondio, pero la clave publica o las politicas no permiten ${action}. Revisa la anon key y RLS.`;
  }

  const reason =
    candidate.message || candidate.details || candidate.hint || 'causa no identificada';

  return `Error al ${action} en Supabase: ${reason}`;
};
