-- 0004_create_templates_and_versions.up.sql
-- Create core tables for AI Templates with versioning
-- Note: Requires Postgres extension uuid-ossp for uuid_generate_v4()

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Base table: templates (no FK to current_version_id yet to avoid circular dependency)
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private')),
  model_provider TEXT NOT NULL DEFAULT 'gemini',
  model_name TEXT NOT NULL DEFAULT 'gemini-1.5-pro',
  current_version_id UUID,              -- FK added after template_versions is created
  created_by_user_id INT,               -- Optional: references users(id) if used
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 2) Version table: immutable records capturing prompt/model params
CREATE TABLE IF NOT EXISTS template_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  version INT NOT NULL,
  prompt_template TEXT NOT NULL,
  negative_prompt TEXT,
  prompt_variables JSONB NOT NULL DEFAULT '{}'::jsonb,   -- e.g. {"style":"anime","intensity":0.8}
  model_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,   -- e.g. {"guidance":7.5,"aspect_ratio":"1:1"}
  input_requirements JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"required_mime":["image/png","image/jpeg"],"max_mb":10}
  output_mime TEXT NOT NULL DEFAULT 'image/png',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, version)
);

-- 3) Add FK from templates.current_version_id to template_versions(id)
ALTER TABLE templates
  ADD CONSTRAINT fk_templates_current_version
  FOREIGN KEY (current_version_id) REFERENCES template_versions(id);

-- 4) Useful indexes
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_visibility ON templates(visibility);
CREATE INDEX IF NOT EXISTS idx_template_versions_template ON template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_created_at ON template_versions(created_at);

-- 5) JSONB GIN indexes (optional, depends on query patterns)
CREATE INDEX IF NOT EXISTS idx_template_versions_prompt_vars_gin ON template_versions USING GIN (prompt_variables);
CREATE INDEX IF NOT EXISTS idx_template_versions_model_params_gin ON template_versions USING GIN (model_parameters);
