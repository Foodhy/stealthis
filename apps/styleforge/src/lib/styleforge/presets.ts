import type { StyleForgeProvider, StyleForgeSelection } from "@stealthis/schema/styleforge";

export interface ConstraintPreset {
  id: string;
  label: string;
  description: string;
  constraints: StyleForgeSelection["constraints"];
}

export const CONSTRAINT_PRESETS: ConstraintPreset[] = [
  {
    id: "editorial-balance",
    label: "Editorial Balance",
    description: "Refined typography, medium density, smooth motion.",
    constraints: {
      density: "balanced",
      radius: "rounded",
      contrast: "balanced",
      motion: "subtle",
      tone: "editorial",
    },
  },
  {
    id: "bold-high-contrast",
    label: "Bold Contrast",
    description: "High-impact visual language with strong hierarchy.",
    constraints: {
      density: "compact",
      radius: "sharp",
      contrast: "high",
      motion: "expressive",
      tone: "bold",
    },
  },
  {
    id: "playful-soft",
    label: "Playful Soft",
    description: "Friendly cards, rounded corners, comfortable rhythm.",
    constraints: {
      density: "airy",
      radius: "pill",
      contrast: "soft",
      motion: "subtle",
      tone: "playful",
    },
  },
  {
    id: "premium-cinematic",
    label: "Premium Cinematic",
    description: "Dark luxurious surfaces with restrained movement.",
    constraints: {
      density: "balanced",
      radius: "rounded",
      contrast: "high",
      motion: "subtle",
      tone: "premium",
    },
  },
  {
    id: "neutral-minimal",
    label: "Neutral Minimal",
    description: "Calm UI baseline for products and dashboards.",
    constraints: {
      density: "compact",
      radius: "rounded",
      contrast: "balanced",
      motion: "none",
      tone: "neutral",
    },
  },
];

export interface ProviderModelOption {
  value: string;
  label: string;
}

const PROVIDER_MODELS: Record<Exclude<StyleForgeProvider, "none">, ProviderModelOption[]> = {
  openai: [
    { value: "gpt-4o-mini", label: "GPT-4o mini" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "o3-mini", label: "o3 mini" },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet-latest", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-5-haiku-latest", label: "Claude 3.5 Haiku" },
  ],
  google: [
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  ],
};

export function modelOptionsForProvider(provider: StyleForgeProvider): ProviderModelOption[] {
  if (provider === "none") {
    return [];
  }

  return PROVIDER_MODELS[provider];
}

export function defaultModelForProvider(provider: StyleForgeProvider): string {
  const options = modelOptionsForProvider(provider);
  return options[0]?.value ?? "";
}
