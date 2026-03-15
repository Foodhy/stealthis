import { useRef, useEffect, useCallback } from "react";
import { highlightSql } from "../lib/markdown";

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
          dangerouslySetInnerHTML={{
            __html: highlightSql(value) + "\n",
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
        style={{ fieldSizing: "fixed" as any, whiteSpace: "pre", overflowWrap: "normal" }}
        spellCheck={false}
        wrap="off"
      />
    </div>
  );
}
