const SELECTED_PROMPT_ID_KEY = 'pd_selected_prompt_id';

export const setSelectedPromptId = (promptId: number | null): void => {
  if (typeof window === 'undefined') return;

  if (promptId === null) {
    window.sessionStorage.removeItem(SELECTED_PROMPT_ID_KEY);
    return;
  }

  window.sessionStorage.setItem(SELECTED_PROMPT_ID_KEY, String(promptId));
};

export const getSelectedPromptId = (): number | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.sessionStorage.getItem(SELECTED_PROMPT_ID_KEY);
  if (!raw) return null;

  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const clearSelectedPromptId = (): void => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(SELECTED_PROMPT_ID_KEY);
};
