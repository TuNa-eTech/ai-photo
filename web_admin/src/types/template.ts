export type Template = {
  id: string;
  name: string;
  thumbnail_url?: string;
  published_at?: string; // ISO-8601
  usage_count?: number;
};

export type TemplatesList = {
  templates: Template[];
};

export type GetTemplatesParams = {
  limit?: number;
  offset?: number;
  q?: string;
  tags?: string; // CSV of tag slugs, e.g., "anime,portrait"
  sort?: 'newest' | 'popular' | 'name';
};
