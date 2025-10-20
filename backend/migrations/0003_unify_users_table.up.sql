BEGIN;

-- 1) Relax legacy users requirements and add profile columns if missing
ALTER TABLE IF EXISTS users
  ALTER COLUMN password_hash DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name VARCHAR(255);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
  END IF;
END $$;

-- 2) Merge data from user_profiles into users by email
INSERT INTO users (email, name, avatar_url, created_at, updated_at)
SELECT p.email, p.name, NULLIF(p.avatar_url, ''), COALESCE(p.created_at, NOW()), COALESCE(p.updated_at, NOW())
FROM user_profiles p
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();

COMMIT;

-- Optional (do in a separate migration after validation):
-- DROP TABLE user_profiles;
