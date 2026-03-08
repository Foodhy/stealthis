import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/native/card';
import { Button } from '@/components/native/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronUp, ChevronDown, Copy, Download, Edit2, Save, FileText, Eye, Plus, Upload, Play } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/i18n';

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
  isLoading = false
}) => {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMarkdownView, setIsMarkdownView] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
      return;
    }
    
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: t('consolidated.copyTitle'),
        description: t('consolidated.copyDescription')
      });
    } catch (error) {
      toast({
        title: t('promptEditor.error'),
        description: t('consolidated.copyErrorDescription'),
        variant: 'destructive'
      });
    }
  };

  const handleExport = () => {
    const promptBlob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(promptBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = t('consolidated.filename');
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: t('consolidated.exportTitle'),
      description: t('consolidated.exportDescription')
    });
  };


  return (
    <Card className="m-4 border-t-2 border-primary">
      <div 
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="font-semibold">{t('consolidated.title')}</h2>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsMarkdownView(!isMarkdownView);
              }}
              className="gap-2"
            >
              {isMarkdownView ? (
                <>
                  <FileText className="h-4 w-4" />
                  {t('consolidated.raw')}
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  {t('consolidated.preview')}
                </>
              )}
            </Button>
          )}
          {onAddSection && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddSection();
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('consolidated.newSection')}
            </Button>
          )}
          {onImport && (
            <label className="cursor-pointer">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4" />
                  {t('consolidated.import')}
                </span>
              </Button>
              <input
                type="file"
                accept=".md,.txt"
                onChange={onImport}
                className="hidden"
              />
            </label>
          )}
          {onSave && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <svg 
                    className="h-4 w-4 animate-spin" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  {t('consolidated.saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t('consolidated.savePrompt')}
                </>
              )}
            </Button>
          )}
          {onTestAgent && (
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                onTestAgent();
              }}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {t('consolidated.testAgent')}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            {t('consolidated.copy')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleExport();
            }}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {t('consolidated.export')}
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          {isMarkdownView ? (
            <div className="min-h-[400px] p-4 border rounded-md bg-background prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{content || t('consolidated.placeholder')}</ReactMarkdown>
            </div>
          ) : (
            <Textarea
              value={content}
              readOnly
              className="min-h-[400px] font-mono text-sm bg-editor-background"
              placeholder={t('consolidated.placeholder')}
            />
          )}
        </div>
      )}
    </Card>
  );
};
