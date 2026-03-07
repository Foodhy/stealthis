import { useState, useCallback } from "react";

const TOKENS = [
  { cls: "text-red-400",    re: /\/\/[^\n]*/g },
  { cls: "text-sky-300",    re: /(['"`])(?:(?!\1)[^\\]|\\.)*\1/g },
  { cls: "text-rose-400",   re: /\b(async|await|function|return|const|let|var|if|else|throw|new|import|export|interface|type|class|for|of|in|extends)\b/g },
  { cls: "text-amber-300",  re: /\b(Promise|Error|string|number|boolean|void|null|undefined)\b/g },
  { cls: "text-purple-300", re: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g },
  { cls: "text-blue-300",   re: /\b\d+(\.\d+)?\b/g },
];

function tokenize(code: string) {
  const safe = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const matches: { start: number; end: number; cls: string; text: string }[] = [];
  for (const { cls, re } of TOKENS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(safe)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, cls, text: m[0] });
    }
  }
  matches.sort((a, b) => a.start - b.start);
  const used = matches.filter((t, i) => i === 0 || t.start >= matches[i - 1].end);
  let html = "";
  let cursor = 0;
  for (const { start, end, cls, text } of used) {
    html += safe.slice(cursor, start);
    html += `<span class="${cls}">${text}</span>`;
    cursor = end;
  }
  html += safe.slice(cursor);
  return html;
}

interface CodeBlockProps {
  code: string;
  language?: string;
  showLines?: boolean;
  highlight?: number[];
}

function CodeBlock({ code, language = "JavaScript", showLines = false, highlight = [] }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const hlSet = new Set(highlight);
  const showLineNums = showLines || highlight.length > 0;
  const highlighted = tokenize(code);
  const lines = highlighted.split("\n");

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="rounded-xl overflow-hidden border border-[#30363d]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#21262d] border-b border-[#30363d]">
        <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wide">{language}</span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border transition-colors ${
            copied
              ? "text-green-400 border-green-400"
              : "text-[#8b949e] border-[#30363d] hover:text-white hover:border-[#8b949e]"
          }`}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto bg-[#161b22] text-[13px] leading-[1.7] font-mono">
        {showLineNums ? (
          <code className="block">
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const isHL = hlSet.has(lineNum);
              return (
                <span
                  key={i}
                  className={`flex ${isHL ? "bg-yellow-400/[0.08] border-l-2 border-yellow-400 -ml-[1px]" : ""}`}
                >
                  <span className="select-none text-right text-[11px] text-[#4a555f] pl-4 pr-3 min-w-[44px] flex-shrink-0">
                    {lineNum}
                  </span>
                  <span
                    className={`flex-1 pr-4 ${isHL ? "text-yellow-100" : ""}`}
                    dangerouslySetInnerHTML={{ __html: line }}
                  />
                </span>
              );
            })}
          </code>
        ) : (
          <code
            className="block px-4 py-4 text-[#e6edf3]"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        )}
      </pre>
    </div>
  );
}

const JS_CODE = `async function fetchUser(id) {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

fetchUser(42).then(user => {
  console.log(user.name);
}).catch(console.error);`;

const TS_CODE = `interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): Promise<User> {
  return fetch(\`/api/users/\${id}\`).then(r => r.json());
}`;

export default function CodeBlockDemo() {
  return (
    <div className="min-h-screen bg-[#0d1117] p-8 flex justify-center">
      <div className="w-full max-width-[680px] space-y-6">
        <div>
          <p className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider mb-2.5">JavaScript</p>
          <CodeBlock code={JS_CODE} language="JavaScript" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider mb-2.5">TypeScript — highlighted lines</p>
          <CodeBlock code={TS_CODE} language="TypeScript" showLines highlight={[7, 8]} />
        </div>
      </div>
    </div>
  );
}
