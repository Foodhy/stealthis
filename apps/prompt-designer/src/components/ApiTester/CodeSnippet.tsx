import React, { useState } from "react";
import { Header } from "@/hooks/useApiTester";
import { Button } from "@/components/native/button";
import { Copy, Check } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useI18n } from "@/i18n";

interface CodeSnippetProps {
  url: string;
  method: string;
  headers: Header[];
  body: string;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({ url, method, headers, body }) => {
  const { t } = useI18n();
  const [language, setLanguage] = useState<"javascript" | "python">("javascript");
  const [copied, setCopied] = useState(false);

  const getJsCode = () => {
    const validHeaders = headers.filter((h) => h.key.trim());
    const hasBody = method !== "GET" && method !== "HEAD";
    const normalizedUrl = url.trim() || "https://api.example.com";

    let bodyBlock = "";
    if (hasBody) {
      if (!body.trim()) {
        bodyBlock = "  body: JSON.stringify({}),\n";
      } else {
        try {
          const parsed = JSON.parse(body);
          bodyBlock = `  body: JSON.stringify(${JSON.stringify(parsed, null, 2)}),\n`;
        } catch {
          bodyBlock = `  body: ${JSON.stringify(body)},\n`;
        }
      }
    }

    return `const myHeaders = new Headers();
${validHeaders.map((h) => `myHeaders.append(${JSON.stringify(h.key)}, ${JSON.stringify(h.value)});`).join("\n")}

const requestOptions = {
  method: "${method}",
  headers: myHeaders,
${bodyBlock}  redirect: "follow"
};

fetch(${JSON.stringify(normalizedUrl)}, requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));`;
  };

  const getPythonCode = () => {
    const headersDict = headers
      .filter((h) => h.key.trim())
      .map((h) => `  ${JSON.stringify(h.key)}: ${JSON.stringify(h.value)}`)
      .join(",\n");

    const hasBody = method !== "GET" && method !== "HEAD";
    const normalizedUrl = url.trim() || "https://api.example.com";

    let payloadBlock = "";
    if (hasBody) {
      if (!body.trim()) {
        payloadBlock = "payload = {}\n";
      } else {
        try {
          const parsed = JSON.parse(body);
          payloadBlock = `payload = ${JSON.stringify(parsed, null, 2)}\n`;
        } catch {
          payloadBlock = `payload = ${JSON.stringify(body)}\n`;
        }
      }
    }

    return `import requests
import json

url = ${JSON.stringify(normalizedUrl)}

${payloadBlock}
headers = {
${headersDict}
}

response = requests.request(${JSON.stringify(method)}, url, headers=headers${hasBody ? ", json=payload" : ""})

print(response.text)`;
  };

  const code = language === "javascript" ? getJsCode() : getPythonCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2 pt-4 border-t">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{t("apiTester.code.requestCode")}</label>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setLanguage("javascript")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                language === "javascript"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("apiTester.code.javascript")}
            </button>
            <button
              onClick={() => setLanguage("python")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                language === "python"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("apiTester.code.python")}
            </button>
          </div>
        </div>
      </div>
      <div className="h-[300px] border rounded-md overflow-hidden relative">
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/50 hover:bg-background backdrop-blur-sm transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          language={language}
          value={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            domReadOnly: true,
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>
    </div>
  );
};
