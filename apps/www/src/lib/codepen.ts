/**
 * Utilities for CodePen embed URLs.
 */

/**
 * Extracts a CodePen embed iframe URL from a pen URL.
 * Supports formats:
 *   - https://codepen.io/{user}/pen/{id}
 *   - https://codepen.io/{user}/full/{id}
 *   - https://codepen.io/{user}/details/{id}
 */
export function getCodePenEmbedUrl(
  penUrl: string,
  opts: { defaultTab?: string } = {}
): string | null {
  const match = penUrl.match(/codepen\.io\/([^/]+)\/(?:pen|full|details)\/([^/?#]+)/);
  if (!match) return null;

  const [, user, id] = match;
  const tab = opts.defaultTab ?? "result";

  return `https://codepen.io/${user}/embed/${id}?default-tab=${tab}&theme-id=dark`;
}

/**
 * Extracts the pen ID from a CodePen URL.
 */
export function getCodePenId(penUrl: string): string | null {
  const match = penUrl.match(/codepen\.io\/[^/]+\/(?:pen|full|details|embed)\/([^/?#]+)/);
  return match?.[1] ?? null;
}
