import React, { useState, useRef } from 'react';
import { Card } from '@/components/native/card';
import { Input } from '@/components/native/input';
import { Edit2, Check } from '@/components/icons';
import { Button } from '@/components/native/button';
import Editor from '@monaco-editor/react';
import { MarkdownToolbar, MarkdownAction } from './MarkdownToolbar';

interface PromptSectionProps {
  title: string;
  content: string;
  onContentChange: (content: string) => void;
  onTitleChange?: (title: string) => void;
  customMarkdownActions?: MarkdownAction[];
}

export const PromptSection: React.FC<PromptSectionProps> = ({
  title,
  content,
  onContentChange,
  onTitleChange,
  customMarkdownActions
}) => {
  const editorRef = useRef<any>(null);

  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line' as 'line',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineHeight: 20,
    wordWrap: 'on' as 'on',
    wrappingIndent: 'indent' as 'indent',
    scrollbar: {
      vertical: "auto" as "auto",
      horizontal: "auto" as "auto",
    },
    theme: 'vs-dark',
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Store the editor reference and bind focus/blur events
    const handleFocus = () => {
      (window as any).currentMonacoEditor = editor;
      console.log('Monaco editor focused');
    };
    
    const handleBlur = () => {
      // Mantener la última referencia activa para permitir clic en variables
      console.log('Monaco editor blurred');
    };
    
    editor.onDidFocusEditorText(handleFocus);
    editor.onDidBlurEditorText(handleBlur);
    
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

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleTitleEdit = () => {
    if (onTitleChange) {
      setIsEditingTitle(true);
      setTempTitle(title);
    }
  };

  const handleTitleSave = () => {
    if (onTitleChange && tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(title);
    setIsEditingTitle(false);
  };

  const handleMarkdownAction = (action: string) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const selection = editor.getSelection();
    const selectedText = editor.getModel()?.getValueInRange(selection) || '';
    
    let newText = '';
    let insertText = '';
    
    switch (action) {
      case 'bold':
        insertText = selectedText ? `**${selectedText}**` : '**texto en negrita**';
        break;
      case 'italic':
        insertText = selectedText ? `*${selectedText}*` : '*texto en cursiva*';
        break;
      case 'strikethrough':
        insertText = selectedText ? `~~${selectedText}~~` : '~~texto tachado~~';
        break;
      case 'heading1':
        insertText = selectedText ? `# ${selectedText}` : '# Encabezado 1';
        break;
      case 'heading2':
        insertText = selectedText ? `## ${selectedText}` : '## Encabezado 2';
        break;
      case 'heading3':
        insertText = selectedText ? `### ${selectedText}` : '### Encabezado 3';
        break;
      case 'bulletList':
        insertText = selectedText ? `- ${selectedText}` : '- Elemento de lista';
        break;
      case 'orderedList':
        insertText = selectedText ? `1. ${selectedText}` : '1. Elemento numerado';
        break;
      case 'codeBlock':
        insertText = selectedText ? `\`\`\`\n${selectedText}\n\`\`\`` : '```\ntu código aquí\n```';
        break;
      case 'blockquote':
        insertText = selectedText ? `> ${selectedText}` : '> Cita';
        break;
      case 'link':
        insertText = selectedText ? `[${selectedText}](url)` : '[texto del enlace](url)';
        break;
      case 'image':
        insertText = selectedText ? `![${selectedText}](url)` : '![texto alternativo](url)';
        break;
      case 'table':
        insertText = '| Encabezado 1 | Encabezado 2 | Encabezado 3 |\n|--------------|--------------|-------------|\n| Celda 1      | Celda 2      | Celda 3     |';
        break;
      case 'undo':
        editor.trigger('keyboard', 'undo', null);
        return;
      case 'redo':
        editor.trigger('keyboard', 'redo', null);
        return;
      default:
        return;
    }

    if (insertText) {
      editor.executeEdits('markdown-action', [
        {
          range: selection,
          text: insertText,
          forceMoveMarkers: true
        }
      ]);
      
      // Position cursor appropriately
      const newPosition = {
        lineNumber: selection.startLineNumber,
        column: selection.startColumn + insertText.length
      };
      editor.setPosition(newPosition);
      editor.focus();
    }
  };

  return (
    <Card className="p-4 h-full min-h-[400px] sm:min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-3 pr-8">
        {isEditingTitle && onTitleChange ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="text-sm font-medium flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') handleTitleCancel();
              }}
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleTitleSave} className="shrink-0">
              <Check className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <h3 className="font-medium text-sm text-foreground truncate">
              {title}
            </h3>
            {onTitleChange && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleTitleEdit}
                className="shrink-0 ml-2"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </>
        )}
      </div>
      <div className="flex-1 border rounded-md overflow-hidden flex flex-col">
        <MarkdownToolbar 
          onAction={handleMarkdownAction}
          customActions={customMarkdownActions}
        />
        <div className="flex-1">
          <Editor
            height="100%"
            language="prompt-template"
            value={content}
            options={editorOptions}
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            theme="vs-dark"
          />
        </div>
      </div>
    </Card>
  );
};