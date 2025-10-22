-- 0006_add_usage_count.up.sql
-- Add usage_count to templates for popularity sorting/metrics

ALTER TABLE templates
  ADD COLUMN IF NOT EXISTS usage_count INT NOT NULL DEFAULT 0;

-- Useful index for popular sort
CREATE INDEX IF NOT EXISTS idx_templates_usage_count ON templates(usage_count);
