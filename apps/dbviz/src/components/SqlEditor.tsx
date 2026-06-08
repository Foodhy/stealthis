import { type CSSProperties, useCallback, useRef } from "react";
import { highlightSql } from "../lib/markdown";

const textareaStyle: CSSProperties & { fieldSizing?: "content" | "fixed" } = {
  fieldSizing: "fixed",
  whiteSpace: "pre",
  overflowWrap: "normal",
};

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SqlEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  return (
    <div className="sql-editor relative h-full w-full">
      {/* Highlighted layer (behind) */}
      <pre
        ref={preRef}
        className="sql-editor-highlight pointer-events-none absolute inset-0 overflow-auto px-4 py-3 font-mono text-xs leading-5"
        aria-hidden="true"
      >
        <code
          className="hljs language-sql"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: highlight.js output for the user's own SQL input.
          dangerouslySetInnerHTML={{
            __html: `${highlightSql(value)}\n`,
          }}
        />
      </pre>

      {/* Transparent textarea (on top) */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        className="sql-editor-textarea absolute inset-0 h-full w-full resize-none bg-transparent px-4 py-3 font-mono text-xs leading-5 text-transparent caret-slate-200 outline-none"
        style={textareaStyle}
        spellCheck={false}
        wrap="off"
      />
    </div>
  );
}
