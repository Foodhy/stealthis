export type SourceType = 'link' | 'json' | 'secret' | 'markdown' | 'text' | 'file';

export interface InformationSource {
    id: number;
    author_id: number; // Placeholder for now, can be 0 or 1
    name: string;
    description?: string;
    source_type: SourceType;
    content?: string;
    url?: string;
    metadata?: Record<string, any>;
    is_active: boolean;
    created_at: string; // ISO string
    updated_at: string; // ISO string
}

export interface InformationSourceInput {
    name: string;
    description?: string;
    source_type: SourceType;
    content?: string;
    url?: string;
    metadata?: Record<string, any>;
}
