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
    ? ` Expected objects: ${expectedObjects.join(', ')}.`
    : '';

  if (haystack.includes('supabase no esta configurado') || haystack.includes('supabase is not configured')) {
    return (
      candidate.message ||
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
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
    return `Could not connect to Supabase while trying to ${action}. Check network, project URL, and CORS.`;
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
    return `Supabase responded, but the expected schema is missing for ${action}.${objectsHint} Run apps/prompt-designer/supabase/schema.sql or switch to VITE_DATA_PROVIDER=local while migrating.`;
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
    return `Supabase responded, but public key or policies do not allow ${action}. Check anon key and RLS settings.`;
  }

  const reason =
    candidate.message || candidate.details || candidate.hint || 'unknown cause';

  return `Supabase error while trying to ${action}: ${reason}`;
};
