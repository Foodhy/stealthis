import { defineCollection, z } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // Structured metadata for Playbooks pages, consumable by MCP/agents.
        playbook: z
          .object({
            area: z.string(),
            type: z.string().optional(),
            covers: z.array(z.string()).optional(),
            situation: z.string().optional(),
            symptoms: z.array(z.string()).optional(),
            recommendation: z.string().optional(),
            complexity_before: z.string().optional(),
            complexity_after: z.string().optional(),
            alternatives: z.array(z.string()).optional(),
          })
          .optional(),
      }),
    }),
  }),
};
