import React, { useState, useRef } from 'react';
import { MarkdownToolbar } from '@/components/MarkdownToolbar';
import ReactMarkdown from 'react-markdown';
import { useI18n } from '@/i18n';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    placeholder,
    className = ''
}) => {
    const { t } = useI18n();
    const [showPreview, setShowPreview] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const resolvedPlaceholder = placeholder ?? t('newSource.markdownPlaceholder');

    const handleAction = (action: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        let newText = value;
        let newCursorPos = start;

        switch (action) {
            case 'bold':
                newText = value.substring(0, start) + `**${selectedText || t('markdownEditor.sample.bold')}**` + value.substring(end);
                newCursorPos = start + 2;
                break;
            case 'italic':
                newText = value.substring(0, start) + `*${selectedText || t('markdownEditor.sample.italic')}*` + value.substring(end);
                newCursorPos = start + 1;
                break;
            case 'strikethrough':
                newText = value.substring(0, start) + `~~${selectedText || t('markdownEditor.sample.strikethrough')}~~` + value.substring(end);
                newCursorPos = start + 2;
                break;
            case 'heading1':
                newText = value.substring(0, start) + `# ${selectedText || t('markdownEditor.sample.heading1')}` + value.substring(end);
                newCursorPos = start + 2;
                break;
            case 'heading2':
                newText = value.substring(0, start) + `## ${selectedText || t('markdownEditor.sample.heading2')}` + value.substring(end);
                newCursorPos = start + 3;
                break;
            case 'heading3':
                newText = value.substring(0, start) + `### ${selectedText || t('markdownEditor.sample.heading3')}` + value.substring(end);
                newCursorPos = start + 4;
                break;
            case 'bulletList':
                newText = value.substring(0, start) + `- ${selectedText || t('markdownEditor.sample.bullet')}` + value.substring(end);
                newCursorPos = start + 2;
                break;
            case 'orderedList':
                newText = value.substring(0, start) + `1. ${selectedText || t('markdownEditor.sample.ordered')}` + value.substring(end);
                newCursorPos = start + 3;
                break;
            case 'codeBlock':
                newText = value.substring(0, start) + `\`\`\`\n${selectedText || t('markdownEditor.sample.code')}\n\`\`\`` + value.substring(end);
                newCursorPos = start + 4;
                break;
            case 'blockquote':
                newText = value.substring(0, start) + `> ${selectedText || t('markdownEditor.sample.quote')}` + value.substring(end);
                newCursorPos = start + 2;
                break;
            case 'link':
                newText = value.substring(0, start) + `[${selectedText || t('markdownEditor.sample.link')}](url)` + value.substring(end);
                newCursorPos = start + 1;
                break;
            case 'image':
                newText = value.substring(0, start) + `![${selectedText || 'alt text'}](url)` + value.substring(end);
                newCursorPos = start + 2;
                break;
            case 'table':
                const table = `| Columna 1 | Columna 2 | Columna 3 |\n|-----------|-----------|-----------||\n| Dato 1    | Dato 2    | Dato 3    |`;
                newText = value.substring(0, start) + table + value.substring(end);
                newCursorPos = start + 2;
                break;
            default:
                return;
        }

        onChange(newText);

        // Restore focus and cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    return (
        <div className={`border rounded-lg overflow-hidden ${className}`}>
            <MarkdownToolbar onAction={handleAction} />

            <div className="flex border-t">
                <button
                    onClick={() => setShowPreview(false)}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${!showPreview
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                >
                    {t('markdownEditor.tab.editor')}
                </button>
                <button
                    onClick={() => setShowPreview(true)}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${showPreview
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                >
                    {t('markdownEditor.tab.preview')}
                </button>
            </div>

            {!showPreview ? (
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={resolvedPlaceholder}
                    className="w-full p-4 min-h-[300px] bg-background font-mono text-sm resize-none focus:outline-none"
                />
            ) : (
                <div className="p-4 min-h-[300px] prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{value || t('markdownEditor.previewEmpty')}</ReactMarkdown>
                </div>
            )}
        </div>
    );
};
