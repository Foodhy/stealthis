import React from 'react';
import { Button } from '@/components/native/button';
import { Separator } from '@/components/native/separator';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3,
  List, 
  ListOrdered, 
  Code2, 
  Link, 
  Quote,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table,
  Image,
  Undo,
  Redo
} from '@/components/icons';

interface MarkdownAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: string;
  shortcut?: string;
}

interface MarkdownToolbarProps {
  onAction: (action: string) => void;
  customActions?: MarkdownAction[];
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  onAction,
  customActions = []
}) => {
  const defaultActions: MarkdownAction[] = [
    { icon: Heading1, label: 'Heading 1', action: 'heading1', shortcut: 'Ctrl+1' },
    { icon: Heading2, label: 'Heading 2', action: 'heading2', shortcut: 'Ctrl+2' },
    { icon: Heading3, label: 'Heading 3', action: 'heading3', shortcut: 'Ctrl+3' },
  ];

  const formattingActions: MarkdownAction[] = [
    { icon: Bold, label: 'Bold', action: 'bold', shortcut: 'Ctrl+B' },
    { icon: Italic, label: 'Italic', action: 'italic', shortcut: 'Ctrl+I' },
    { icon: Strikethrough, label: 'Strikethrough', action: 'strikethrough', shortcut: 'Ctrl+Shift+S' },
  ];

  const listActions: MarkdownAction[] = [
    { icon: List, label: 'Bullet List', action: 'bulletList', shortcut: 'Ctrl+Shift+8' },
    { icon: ListOrdered, label: 'Numbered List', action: 'orderedList', shortcut: 'Ctrl+Shift+7' },
  ];

  const insertActions: MarkdownAction[] = [
    { icon: Code2, label: 'Code Block', action: 'codeBlock', shortcut: 'Ctrl+Alt+C' },
    { icon: Quote, label: 'Quote', action: 'blockquote', shortcut: 'Ctrl+Shift+>' },
    { icon: Link, label: 'Link', action: 'link', shortcut: 'Ctrl+K' },
    { icon: Image, label: 'Image', action: 'image', shortcut: 'Ctrl+Alt+I' },
    { icon: Table, label: 'Table', action: 'table' },
  ];

  const alignActions: MarkdownAction[] = [
    { icon: AlignLeft, label: 'Align Left', action: 'alignLeft' },
    { icon: AlignCenter, label: 'Align Center', action: 'alignCenter' },
    { icon: AlignRight, label: 'Align Right', action: 'alignRight' },
  ];

  const historyActions: MarkdownAction[] = [
    { icon: Undo, label: 'Undo', action: 'undo', shortcut: 'Ctrl+Z' },
    { icon: Redo, label: 'Redo', action: 'redo', shortcut: 'Ctrl+Y' },
  ];

  const renderActionGroup = (actions: MarkdownAction[]) => (
    actions.map((action) => (
      <Button
        key={action.action}
        variant="ghost"
        size="sm"
        onClick={() => onAction(action.action)}
        className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
        title={`${action.label} ${action.shortcut ? `(${action.shortcut})` : ''}`}
      >
        <action.icon className="h-4 w-4" />
      </Button>
    ))
  );

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-card/50">
      {/* Headings */}
      <div className="flex items-center gap-1">
        {renderActionGroup(defaultActions)}
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        {renderActionGroup(formattingActions)}
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* Lists */}
      <div className="flex items-center gap-1">
        {renderActionGroup(listActions)}
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* Insert Elements */}
      <div className="flex items-center gap-1">
        {renderActionGroup(insertActions)}
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* Alignment */}
      <div className="flex items-center gap-1">
        {renderActionGroup(alignActions)}
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* History */}
      <div className="flex items-center gap-1">
        {renderActionGroup(historyActions)}
      </div>
      
      {/* Custom Actions */}
      {customActions.length > 0 && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-1">
            {renderActionGroup(customActions)}
          </div>
        </>
      )}
    </div>
  );
};

export type { MarkdownAction };