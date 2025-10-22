export type TemplateAdmin = {
  id: string; // mirror slug
  slug: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private';
  published_at?: string; // ISO-8601
  usage_count?: number;
  updated_at?: string; // ISO-8601
  tags?: string[];
};

export type AdminTemplatesList = {
  templates: TemplateAdmin[];
};

export type TemplateAssetAdmin = {
  id: string;
  url: string;
  kind: 'thumbnail' | 'cover' | 'preview';
  sort_order: number;
  created_at?: string;
};

export type CreateTemplateInput = {
  slug: string;
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private';
  tags?: string[];
  thumbnail_url?: string; // Phase 1: URL input
};

export type UpdateTemplateInput = {
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private';
  tags?: string[];
  thumbnail_url?: string; // optional update
};

export type AdminTemplatesParams = {
  limit?: number;
  offset?: number;
  q?: string;
  tags?: string; // CSV of tag slugs
  status?: 'draft' | 'published' | 'archived';
  visibility?: 'public' | 'private';
  sort?: 'updated' | 'newest' | 'popular' | 'name';
};
