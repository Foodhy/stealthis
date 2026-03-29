import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/native/card";
import { Button } from "@/components/native/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Download,
  Save,
  FileText,
  Eye,
  Plus,
  Play,
} from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";

interface ConsolidatedViewProps {
  content: string;
  onContentChange?: (content: string) => void;
  sections?: { [key: string]: string };
  onCopy?: () => void;
  onAddSection?: () => void;
  onImport?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave?: () => void;
  onTestAgent?: () => void;
  isLoading?: boolean;
}

export const ConsolidatedView: React.FC<ConsolidatedViewProps> = ({
  content,
  onContentChange,
  sections,
  onCopy,
  onAddSection,
  onImport,
  onSave,
  onTestAgent,
  isLoading = false,
}) => {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMarkdownView, setIsMarkdownView] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
      return;
    }
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: t("consolidated.copyTitle"), description: t("consolidated.copyDescription") });
    } catch {
      toast({
        title: t("promptEditor.error"),
        description: t("consolidated.copyErrorDescription"),
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = t("consolidated.filename");
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: t("consolidated.exportTitle"),
      description: t("consolidated.exportDescription"),
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="mx-2 sm:mx-4 mt-2 sm:mt-0 border-t-2 border-primary overflow-hidden">
      {/* Toolbar — single row with all actions */}
      <div className="px-3 sm:px-4 py-2 flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
        {/* Expand toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors shrink-0 mr-1"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="hidden sm:inline">{t("consolidated.title")}</span>
        </button>

        {/* Primary: Save */}
        {onSave && (
          <Button
            size="sm"
            onClick={onSave}
            disabled={isLoading}
            className="h-7 gap-1 text-xs px-2.5"
          >
            {isLoading ? (
              <svg
                className="h-3.5 w-3.5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {t("consolidated.savePrompt")}
          </Button>
        )}

        {/* Primary: Test */}
        {onTestAgent && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onTestAgent}
            className="h-7 gap-1 text-xs px-2.5"
          >
            <Play className="h-3.5 w-3.5" />
            {t("consolidated.testAgent")}
          </Button>
        )}

        <div className="h-4 w-px bg-border/40 mx-0.5 shrink-0" />

        {/* Secondary actions */}
        {onAddSection && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddSection}
            className="h-7 gap-1 text-xs px-2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("consolidated.newSection")}</span>
          </Button>
        )}

        {onImport && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImportClick}
              className="h-7 gap-1 text-xs px-2 text-muted-foreground hover:text-foreground"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="hidden sm:inline">{t("consolidated.import")}</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt"
              onChange={onImport}
              className="hidden"
            />
          </>
        )}

        {/* Right side utilities */}
        <div className="ml-auto flex items-center gap-0.5 shrink-0">
          {isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMarkdownView(!isMarkdownView)}
              className="h-7 w-7 p-0"
              title={isMarkdownView ? t("consolidated.raw") : t("consolidated.preview")}
            >
              {isMarkdownView ? (
                <FileText className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 w-7 p-0"
            title={t("consolidated.copy")}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="h-7 w-7 p-0"
            title={t("consolidated.export")}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          {isMarkdownView ? (
            <div className="min-h-[200px] sm:min-h-[300px] p-4 border rounded-md bg-background prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{content || t("consolidated.placeholder")}</ReactMarkdown>
            </div>
          ) : (
            <Textarea
              value={content}
              readOnly
              className="min-h-[200px] sm:min-h-[300px] font-mono text-sm bg-editor-background"
              placeholder={t("consolidated.placeholder")}
            />
          )}
        </div>
      )}
    </Card>
  );
};
