import { useState } from 'react';
import { PromptEditor } from '@/components/PromptEditor';
import { PromptGrid } from '@/components/PromptGrid';
import { PasswordGate } from '@/components/PasswordGate';

const Index = () => {
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleSelectPrompt = (promptId: number) => {
    setSelectedPromptId(promptId);
  };

  const handleCreateNew = () => {
    setIsCreatingNew(true);
  };

  const handleBackToGrid = () => {
    setSelectedPromptId(null);
    setIsCreatingNew(false);
  };

  // Show editor if a prompt is selected or creating new
  const showEditor = selectedPromptId !== null || isCreatingNew;

  return (
    <PasswordGate>
      {showEditor ? (
        <PromptEditor 
          promptId={selectedPromptId} 
          onBack={handleBackToGrid}
        />
      ) : (
        <PromptGrid 
          onSelectPrompt={handleSelectPrompt}
          onCreateNew={handleCreateNew}
        />
      )}
    </PasswordGate>
  );
};

export default Index;
