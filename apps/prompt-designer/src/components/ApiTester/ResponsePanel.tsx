import React from "react";
import { Card } from "@/components/native/card";
import { Badge } from "@/components/native/badge";
import Editor from "@monaco-editor/react";
import { useI18n } from "@/i18n";

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
}

interface ResponsePanelProps {
  response: ApiResponse | null;
  error: string | null;
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({ response, error }) => {
  const { t } = useI18n();
  const responseAsText =
    response == null
      ? ""
      : typeof response.data === "object"
        ? JSON.stringify(response.data, null, 2)
        : String(response.data);
  const responseLanguage =
    response == null ? "json" : typeof response.data === "object" ? "json" : "plaintext";

  return (
    <div className="h-full flex flex-col">
      <label className="text-sm font-medium mb-2">{t("apiTester.response.title")}</label>
      <Card className="flex-1 p-0 overflow-hidden flex flex-col border min-h-[400px]">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50">
            <p className="font-medium">{t("apiTester.response.error")}</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {response ? (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    response.status >= 200 && response.status < 300 ? "default" : "destructive"
                  }
                >
                  {response.status} {response.statusText}
                </Badge>
                <span className="text-xs text-muted-foreground">{response.duration}ms</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {Object.keys(response.headers).length === 1
                  ? t("apiTester.response.headers_one", {
                      count: Object.keys(response.headers).length,
                    })
                  : t("apiTester.response.headers_other", {
                      count: Object.keys(response.headers).length,
                    })}
              </div>
            </div>
            <div className="flex-1 min-h-0 relative">
              <Editor
                height="100%"
                language={responseLanguage}
                defaultValue=""
                value={responseAsText}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  domReadOnly: true,
                  wordWrap: "on",
                }}
              />
            </div>
          </div>
        ) : (
          !error && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-8 text-center">
              {t("apiTester.response.empty")}
            </div>
          )
        )}
      </Card>
    </div>
  );
};
