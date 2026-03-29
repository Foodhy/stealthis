import { routes } from "@/lib/routes";

export interface ChangelogEntry {
  version: string;
  date: string;
  description: string;
  updates: {
    type: "feature" | "fix" | "improvement" | "chore";
    content: string;
    link?: string; // Optional internal link
  }[];
}

export const changelogData: ChangelogEntry[] = [
  {
    version: "0.1.0",
    date: "2025-12-11", // Using today's date based on metadata
    description: "changelog.entry.0.description",
    updates: [
      {
        type: "feature",
        content: "changelog.entry.0.update.0",
        link: routes.changelog,
      },
      {
        type: "feature",
        content: "changelog.entry.0.update.1",
        link: routes.values,
      },
      {
        type: "improvement",
        content: "changelog.entry.0.update.2",
        link: routes.testEndpoints,
      },
      {
        type: "feature",
        content: "changelog.entry.0.update.3",
        link: routes.newSource,
      },
    ],
  },
];
