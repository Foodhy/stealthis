import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/native/select";
import { Input } from "@/components/native/input";
import { Button } from "@/components/native/button";
import { Card } from "@/components/native/card";
import { HttpMethod, Header } from "@/hooks/useApiTester";
import { ApiConfiguration } from "@/services/apiConfigService";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CodeSnippet } from "./CodeSnippet";
import Editor from "@monaco-editor/react";
import { useI18n } from "@/i18n";
interface RequestPanelProps {
  url: string;
  onUrlChange: (url: string) => void;
  method: HttpMethod;
  onMethodChange: (method: HttpMethod) => void;
  body: string;
  onBodyChange: (body: string) => void;
  headers: Header[];
  onAddHeader: () => void;
  onUpdateHeader: (id: string, key: string, value: string) => void;
  onRemoveHeader: (id: string) => void;
  onExecute: () => void;
  isLoading: boolean;
  onRestoreConfiguration: (id: string) => void;
  onDeleteConfiguration: (id: string) => void;
  onClearHistory: () => void;
  savedConfigurations: ApiConfiguration[];
  hasSavedConfigurations: boolean;
}

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export const RequestPanel: React.FC<RequestPanelProps> = ({
  url,
  onUrlChange,
  method,
  onMethodChange,
  body,
  onBodyChange,
  headers,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
  onExecute,
  isLoading,
  onRestoreConfiguration,
  onDeleteConfiguration,
  onClearHistory,
  savedConfigurations,
  hasSavedConfigurations,
}) => {
  const { t, locale } = useI18n();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(locale === "es" ? "es-ES" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };
  return (
    <>
      <Card className="p-4 space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t("apiTester.request.selectEndpoint")}</label>
          <div className="flex gap-2">
            <div className="w-32 flex-shrink-0">
              <Select value={method} onValueChange={(val) => onMethodChange(val as HttpMethod)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("apiTester.request.method")} />
                </SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder={t("apiTester.request.enterUrl")}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t("apiTester.request.headers")}</label>
            <Button
              type="button"
              onClick={onAddHeader}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              {t("apiTester.request.addHeader")}
            </Button>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {headers.map((header) => (
              <div key={header.id} className="flex gap-2 items-center">
                <Input
                  value={header.key}
                  onChange={(e) => onUpdateHeader(header.id, e.target.value, header.value)}
                  placeholder={t("apiTester.request.headerName")}
                  className="flex-1 text-sm"
                />
                <Input
                  value={header.value}
                  onChange={(e) => onUpdateHeader(header.id, header.key, e.target.value)}
                  placeholder={t("apiTester.request.headerValue")}
                  className="flex-1 text-sm"
                />
                <Button
                  type="button"
                  onClick={() => onRemoveHeader(header.id)}
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {method !== "GET" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("apiTester.request.body")}</label>
            <div className="h-[200px] border rounded-md overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={body}
                onChange={(value) => onBodyChange(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 10, bottom: 10 },
                }}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Button
            onClick={onExecute}
            disabled={isLoading || !url}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? t("apiTester.request.executing") : t("apiTester.request.execute")}
          </Button>
        </div>

        <Accordion type="single" className="w-full">
          <AccordionItem value="code" className="border-none">
            <AccordionTrigger className="py-2 text-xs text-muted-foreground hover:no-underline justify-start gap-2">
              <span>{t("apiTester.request.viewCodeSnippets")}</span>
            </AccordionTrigger>
            <AccordionContent>
              <CodeSnippet url={url} method={method} headers={headers} body={body} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Saved Configurations List */}
      {hasSavedConfigurations && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {t("apiTester.request.savedConfigurations")}
            </label>
            <Button
              type="button"
              onClick={onClearHistory}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive"
              title={t("apiTester.request.clearHistoryTitle")}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              {t("apiTester.request.clearHistory")}
            </Button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-2 bg-muted/20">
            {savedConfigurations.map((config) => (
              <div
                key={config.id}
                className="flex items-center gap-2 p-2 rounded-md bg-background border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded">
                      {config.method}
                    </span>
                    <span className="text-xs text-muted-foreground truncate" title={config.url}>
                      {truncateUrl(config.url)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDate(config.savedAt)}</div>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    onClick={() => onRestoreConfiguration(config.id)}
                    disabled={isLoading}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title={t("apiTester.request.restoreConfigTitle")}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onDeleteConfiguration(config.id)}
                    disabled={isLoading}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title={t("apiTester.request.deleteConfigTitle")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
