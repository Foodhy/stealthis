// Native utility function to combine class names
// Replaces clsx + tailwind-merge functionality
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}