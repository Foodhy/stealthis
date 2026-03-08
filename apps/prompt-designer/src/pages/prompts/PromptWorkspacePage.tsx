import React, { useEffect, useState } from 'react';
import { PasswordGate } from '@/components/PasswordGate';
import { PromptEditor } from '@/components/PromptEditor';
import { useRouter } from '@/lib/router';
import { routes } from '@/lib/routes';
import { useI18n } from '@/i18n';
import { clearSelectedPromptId, getSelectedPromptId } from '@/lib/promptNavigationState';
import { Button } from '@/components/native/button';
import { Card } from '@/components/native/card';
import { ArrowLeft } from 'lucide-react';

interface PromptWorkspacePageProps {
  mode: 'new' | 'edit';
}

export const PromptWorkspacePage: React.FC<PromptWorkspacePageProps> = ({
  mode,
}) => {
  const { navigate } = useRouter();
  const { t } = useI18n();
  const [promptId, setPromptId] = useState<number | null>(() =>
    mode === 'edit' ? getSelectedPromptId() : null,
  );

  useEffect(() => {
    if (mode === 'new') {
      clearSelectedPromptId();
      setPromptId(null);
      return;
    }

    setPromptId(getSelectedPromptId());
  }, [mode]);

  const handleBack = () => {
    navigate(routes.prompts);
  };

  if (mode === 'edit' && promptId === null) {
    return (
      <PasswordGate>
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-3xl mx-auto">
            <Card className="p-6 space-y-4">
              <h1 className="text-xl font-semibold">{t('workspace.noPromptSelectedTitle')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('workspace.noPromptSelectedDescription')}
              </p>
              <Button onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('workspace.backToProjects')}
              </Button>
            </Card>
          </div>
        </div>
      </PasswordGate>
    );
  }

  return (
    <PasswordGate>
      <PromptEditor
        promptId={promptId}
        onBack={handleBack}
      />
    </PasswordGate>
  );
};
