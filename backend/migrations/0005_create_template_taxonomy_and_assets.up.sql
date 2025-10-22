-- 0005_create_template_taxonomy_and_assets.up.sql
-- Taxonomy (tags, categories) and template assets for AI Templates

-- 1) Tags and mapping to templates (many-to-many)
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS template_tags (
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (template_id, tag_id)
);

-- 2) Categories and mapping to templates (many-to-many)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS template_categories (
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (template_id, category_id)
);

-- 3) Template assets (thumbnail, cover, preview, etc.)
CREATE TABLE IF NOT EXISTS template_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('thumbnail','cover','preview')),
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- 4) Useful indexes
CREATE INDEX IF NOT EXISTS idx_template_assets_template ON template_assets(template_id, sort_order);
