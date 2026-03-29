import React, { useRef, useEffect } from "react";
import { Badge } from "@/components/native/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/native/button";
import { X } from "@/components/icons";
import Editor from "@monaco-editor/react";
import "./FullscreenEditor.css";
import { useI18n } from "@/i18n";

import { PromptVariable } from "@/services/valuesService";

interface FullscreenEditorProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  onContentChange: (content: string) => void;
  variables: PromptVariable[];
}

export const FullscreenEditor: React.FC<FullscreenEditorProps> = ({
  isOpen,
  onClose,
  title,
  content,
  onContentChange,
  variables,
}) => {
  const { t } = useI18n();
  const editorRef = useRef<any>(null);

  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: "line" as "line",
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineHeight: 20,
    wordWrap: "on" as "on",
    wrappingIndent: "indent" as "indent",
    scrollbar: {
      vertical: "auto" as "auto",
      horizontal: "auto" as "auto",
    },
    theme: "vs-dark",
    renderLineHighlight: "all" as "all",
    renderWhitespace: "selection" as "selection",
    padding: { top: 10, bottom: 10 },
  };
  const insertVariableAtCursor = (variable: string) => {
    const editor = editorRef.current;
    if (!editor) {
      console.log("No editor reference found");
      return;
    }

    const selection = editor.getSelection();
    if (selection) {
      const variableText = `{{${variable}}}`;
      console.log(
        "Inserting variable in fullscreen editor:",
        variableText,
        "at selection:",
        selection
      );

      editor.executeEdits("insert-variable", [
        {
          range: selection,
          text: variableText,
          forceMoveMarkers: true,
        },
      ]);

      // Move cursor to the end of the inserted variable
      const newPosition = {
        lineNumber: selection.startLineNumber,
        column: selection.startColumn + variableText.length,
      };
      editor.setPosition(newPosition);
      editor.focus();
      console.log("Variable inserted successfully in fullscreen editor");
    } else {
      console.log("No selection found in fullscreen editor");
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Force layout update after a short delay to ensure proper rendering
    setTimeout(() => {
      editor.layout();
    }, 100);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onContentChange(value);
    }
  };

  // Force editor layout when component mounts or content changes
  useEffect(() => {
    if (editorRef.current) {
      const timer = setTimeout(() => {
        editorRef.current?.layout();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [content]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fullscreen-editor">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-accent">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="main-content flex">
        {/* Editor Section */}
        <div className="editor-container flex flex-col">
          <div className="flex-1 border-r border-border">
            <Editor
              height="100%"
              width="100%"
              language="plaintext"
              value={content}
              options={editorOptions}
              onMount={handleEditorDidMount}
              onChange={handleEditorChange}
              theme="vs-dark"
              loading={
                <div className="flex items-center justify-center h-full">
                  {t("fullscreen.loadingEditor")}
                </div>
              }
            />
          </div>
        </div>

        {/* Variables Panel */}
        <div className="variables-panel border-l border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-medium text-sm">{t("fullscreen.variables")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("fullscreen.variablesHelp")}</p>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {variables.map((variable) => (
                <Badge
                  key={variable.variable_name}
                  variant="secondary"
                  className="block w-full cursor-pointer px-3 py-2 text-xs bg-variable-bg text-variable-text hover:bg-accent transition-colors"
                  onClick={() => insertVariableAtCursor(variable.variable_name)}
                  title={variable.description}
                >
                  {`{{${variable.variable_name}}}`}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
