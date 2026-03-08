import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/native/button';
import { Input } from '@/components/native/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/native/select';
import { Card } from '@/components/native/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/native/separator';
import { Badge } from '@/components/native/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from '@/components/icons';
import { useI18n } from '@/i18n';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type Provider = 'ollama' | 'openai';

import { PromptVariable } from '@/services/valuesService';

interface AgentTesterProps {
  isOpen: boolean;
  onClose: () => void;
  systemTemplate: string; // consolidated prompt markdown
  variables: PromptVariable[];     // available variable names
}

export const AgentTester: React.FC<AgentTesterProps> = ({ isOpen, onClose, systemTemplate, variables }) => {
  const { toast } = useToast();
  const { t } = useI18n();

  const detectedVariables = React.useMemo(() => {
    const regex = /\{\{(.*?)\}\}/g;
    const seen = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = regex.exec(systemTemplate)) !== null) {
      const key = (match[1] || '').trim();
      if (key) seen.add(key);
    }
    return Array.from(seen);
  }, [systemTemplate]);

  const [provider, setProvider] = React.useState<Provider>('ollama');
  const [ollamaModels, setOllamaModels] = React.useState<string[]>([]);
  const [model, setModel] = React.useState<string>('');
  const [ollamaBaseUrl, setOllamaBaseUrl] = React.useState<string>('http://localhost:11434');
  const [openaiBaseUrl, setOpenaiBaseUrl] = React.useState<string>('https://api.openai.com/v1');
  const [openaiApiKey, setOpenaiApiKey] = React.useState<string>('');

  const [messageInput, setMessageInput] = React.useState<string>('');
  const [isSending, setIsSending] = React.useState<boolean>(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [variableValues, setVariableValues] = React.useState<Record<string, string>>({});
  const [showApiKey, setShowApiKey] = React.useState<boolean>(false);

  const resolvedSystemPrompt = React.useMemo(() => {
    return detectedVariables.reduce((acc, key) => {
      const value = variableValues[key] ?? '';
      return acc.replace(new RegExp(`\\{\\{${key.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, '\\$&')}\\}\\}`, 'g'), value);
    }, systemTemplate);
  }, [detectedVariables, variableValues, systemTemplate]);

  const loadOllamaModels = React.useCallback(async () => {
    try {
      const res = await fetch(`${ollamaBaseUrl.replace(/\/$/, '')}/api/tags`);
      if (!res.ok) throw new Error(t('agentTester.errorLoadModels'));
      const data = await res.json();
      const list: string[] = Array.isArray(data?.models)
        ? data.models.map((m: any) => m.model || m.name).filter(Boolean)
        : [];
      setOllamaModels(list);
      if (!model && list.length) setModel(list[0]);
    } catch (err: any) {
      toast({
        title: t('agentTester.providerOllama'),
        description: `${err?.message || t('agentTester.errorLoadModels')} (${ollamaBaseUrl})`,
        variant: 'destructive'
      });
    }
  }, [model, toast, ollamaBaseUrl, t]);

  React.useEffect(() => {
    if (isOpen && provider === 'ollama') {
      loadOllamaModels();
    }
  }, [isOpen, provider, loadOllamaModels]);

  const handleReset = () => {
    setMessages([]);
    setMessageInput('');
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;
    const currentModel = model.trim();
    if (provider === 'ollama' && !currentModel) {
      toast({
        title: t('agentTester.modelRequiredTitle'),
        description: t('agentTester.modelRequiredDescription'),
        variant: 'destructive'
      });
      return;
    }
    if (provider === 'openai' && (!openaiApiKey || !currentModel)) {
      toast({
        title: t('agentTester.incompleteConfigTitle'),
        description: t('agentTester.incompleteConfigDescription'),
        variant: 'destructive'
      });
      return;
    }

    const nextMessages: ChatMessage[] = [
      { role: 'system', content: resolvedSystemPrompt },
      ...messages,
      { role: 'user', content: messageInput }
    ];

    setMessages(prev => [...prev, { role: 'user', content: messageInput }]);
    setMessageInput('');
    setIsSending(true);

    try {
      let assistantReply = '';
      if (provider === 'ollama') {
        const res = await fetch(`${ollamaBaseUrl.replace(/\/$/, '')}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: currentModel,
            messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
            stream: false
          })
        });
        if (!res.ok) throw new Error(t('agentTester.errorGenerateOllama'));
        const data = await res.json();
        assistantReply = data?.message?.content || data?.response || '';
      } else {
        const url = `${openaiBaseUrl.replace(/\/$/, '')}/chat/completions`;
        const lowerModel = currentModel.toLowerCase();
        const payload: any = {
          model: currentModel,
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          temperature: 1
        };
        /**if (lowerModel.includes('gpt-5')) {
          payload.max_completion_tokens = 512;
          payload.reasoning_effort = 'medium';
        } else {
          payload.max_tokens = 512;
        }*/

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => undefined);
        if (!res.ok) {
          const msg = data?.error?.message || data?.message || t('agentTester.errorGenerateOpenai');
          throw new Error(msg);
        }
        assistantReply = data?.choices?.[0]?.message?.content || '';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantReply }]);
    } catch (err: any) {
      toast({ title: t('promptEditor.error'), description: err?.message || t('agentTester.errorSend'), variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isSending) sendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-xl font-semibold">{t('agentTester.title')}</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleReset}>{t('agentTester.reset')}</Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <Card className="flex-1 overflow-hidden flex flex-col">
              <div className="p-3 border-b flex items-center gap-3">
                <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('agentTester.providerPlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ollama">{t('agentTester.providerOllama')}</SelectItem>
                    <SelectItem value="openai">{t('agentTester.providerOpenai')}</SelectItem>
                  </SelectContent>
                </Select>

                {provider === 'ollama' ? (
                  <>
                    <Input className="w-[240px]" placeholder={t('agentTester.ollamaBaseUrl')} value={ollamaBaseUrl} onChange={(e) => setOllamaBaseUrl(e.target.value)} />
                    <Select value={model} onValueChange={(v) => setModel(v)}>
                      <SelectTrigger className="w-[220px]"><SelectValue placeholder={t('agentTester.model')} /></SelectTrigger>
                      <SelectContent>
                        {ollamaModels.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" onClick={loadOllamaModels}>{t('agentTester.refreshModels')}</Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input className="w-[220px]" placeholder={t('agentTester.openaiBaseUrl')} value={openaiBaseUrl} onChange={(e) => setOpenaiBaseUrl(e.target.value)} />
                    <div className="relative w-[220px]">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        className="pr-8"
                        placeholder={t('agentTester.apiKey')}
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => setShowApiKey(v => !v)}
                        title={showApiKey ? t('agentTester.hide') : t('agentTester.show')}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Input className="w-[200px]" placeholder={t('agentTester.model')} value={model} onChange={(e) => setModel(e.target.value)} />
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  <div className="text-xs text-muted-foreground">
                    <span className="mr-2">{t('agentTester.systemLabel')}:</span>
                    <Badge variant="outline">{t('agentTester.consolidatedPrompt')}</Badge>
                  </div>
                  <Separator />
                  {messages.length === 0 && (
                    <div className="text-sm text-muted-foreground">{t('agentTester.startConversation')}</div>
                  )}
                  {messages.map((m, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium mr-2">{m.role === 'user' ? t('agentTester.you') : t('agentTester.agent')}:</span>
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    </div>
                  ))}
                  {isSending && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('agentTester.agentResponding')}</span>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-3 border-t">
                <div className="flex items-end gap-2">
                  <Textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('agentTester.messagePlaceholder')} className="flex-1" />
                  <Button onClick={sendMessage} disabled={isSending || !messageInput.trim()} className="min-w-[96px] flex items-center justify-center gap-2">
                    {isSending ? (<><Loader2 className="h-4 w-4 animate-spin" /><span>{t('agentTester.sending')}</span></>) : t('agentTester.send')}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1 flex flex-col min-h-0">
            <Card className="flex-1 overflow-hidden">
              <div className="p-3 border-b text-sm font-medium">{t('agentTester.variablesTitle')}</div>
              <ScrollArea className="h-full">
                <div className="p-3 space-y-3">
                  {detectedVariables.length === 0 && (
                    <div className="text-xs text-muted-foreground">{t('agentTester.noVariablesDetected')}</div>
                  )}
                  {detectedVariables.map((name) => (
                    <div key={name} className="space-y-1">
                      <label className="text-xs text-muted-foreground">{`{{${name}}}`}</label>
                      <Input
                        value={variableValues[name] ?? ''}
                        onChange={(e) => setVariableValues(prev => ({ ...prev, [name]: e.target.value }))}
                        placeholder={t('agentTester.valueFor', { name })}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentTester;
