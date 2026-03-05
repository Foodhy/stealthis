export interface ChangelogEntry {
    version: string;
    date: string;
    description: string;
    updates: {
        type: 'feature' | 'fix' | 'improvement' | 'chore';
        content: string;
        link?: string; // Optional internal link
    }[];
}

export const changelogData: ChangelogEntry[] = [
    {
        version: "0.1.0",
        date: "2025-12-11", // Using today's date based on metadata
        description: "Initial release of the Changelog feature and recent UI enhancements.",
        updates: [
            {
                type: "feature",
                content: "Added Changelog page to track application updates.",
                link: "/changelog"
            },
            {
                type: "feature",
                content: "Added 'Valores' page for managing global settings.",
                link: "/values"
            },
            {
                type: "improvement",
                content: "Enhanced API Tester UI with syntax highlighting.",
                link: "/test-endpoints"
            },
            {
                type: "feature",
                content: "Implemented 'Fuentes de Información' management. Supports various types (Text, Markdown, JSON, Link, Secret, File) with filtering, sorting, and favorites capabilities.",
                link: "/new-source"
            }
        ]
    }
];
