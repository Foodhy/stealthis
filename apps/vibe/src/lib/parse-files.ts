export type ParsedFile = {
  path: string;
  content: string;
};

/**
 * Extract file blocks from LLM output.
 * Supports patterns like:
 *   ```filepath:src/App.tsx
 *   ...code...
 *   ```
 * or:
 *   ```tsx filepath:src/App.tsx
 *   ...code...
 *   ```
 */
export function parseFilesFromResponse(text: string): ParsedFile[] {
  const files: ParsedFile[] = [];
  const regex = /```[\w]*\s*filepath:([^\n]+)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const path = match[1].trim();
    const content = match[2].trimEnd();
    if (path) {
      files.push({ path, content });
    }
  }

  return files;
}

export type ParsedCommand = {
  command: string;
};

/**
 * Extract shell commands from LLM output.
 * Matches ```bash or ```sh code blocks.
 */
export function parseCommandsFromResponse(text: string): ParsedCommand[] {
  const commands: ParsedCommand[] = [];
  const regex = /```(?:bash|sh|shell|zsh)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const block = match[1].trim();
    // Split multi-line commands but keep multi-line commands (ending with \) together
    for (const line of block.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        commands.push({ command: trimmed });
      }
    }
  }

  return commands;
}
