import React from "react";
import { PasswordGate } from "@/components/PasswordGate";
import { PromptGrid } from "@/components/PromptGrid";
import { routes } from "@/lib/routes";
import { useRouter } from "@/lib/router";
import { clearSelectedPromptId, setSelectedPromptId } from "@/lib/promptNavigationState";

export const PromptManagerHome: React.FC = () => {
  const { navigate } = useRouter();

  const handleSelectPrompt = (promptId: number) => {
    setSelectedPromptId(promptId);
    navigate(routes.promptsEdit);
  };

  const handleCreateNew = () => {
    clearSelectedPromptId();
    navigate(routes.promptsNew);
  };

  return (
    <PasswordGate>
      <PromptGrid onSelectPrompt={handleSelectPrompt} onCreateNew={handleCreateNew} />
    </PasswordGate>
  );
};
