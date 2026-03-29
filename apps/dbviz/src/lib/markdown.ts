import { Marked } from "marked";
import hljs from "highlight.js/lib/core";

import sql from "highlight.js/lib/languages/sql";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import yaml from "highlight.js/lib/languages/yaml";
import python from "highlight.js/lib/languages/python";

hljs.registerLanguage("sql", sql);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("python", python);

const marked = new Marked({
  renderer: {
    code({ text, lang }) {
      const language = lang || "";
      let highlighted: string;
      try {
        if (language && hljs.getLanguage(language)) {
          highlighted = hljs.highlight(text, { language }).value;
        } else {
          highlighted = hljs.highlightAuto(text).value;
        }
      } catch {
        highlighted = escapeHtml(text);
      }
      return `<pre class="hljs-code-block"><code class="hljs language-${language}">${highlighted}</code></pre>`;
    },
    codespan({ text }) {
      return `<code class="hljs-inline">${text}</code>`;
    },
  },
});

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderMarkdown(text: string): string {
  return marked.parse(text) as string;
}

export function highlightSql(text: string): string {
  try {
    return hljs.highlight(text, { language: "sql" }).value;
  } catch {
    return escapeHtml(text);
  }
}

export { hljs };
