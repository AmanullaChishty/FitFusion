-- 005_create_progress.sql
ALTER TABLE progress
ADD COLUMN IF NOT EXISTS weight_kg numeric(5,2),
ADD COLUMN IF NOT EXISTS body_fat_pct numeric(5,2),
ADD COLUMN IF NOT EXISTS strength_milestones jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS rpe numeric(3,1),
ADD COLUMN IF NOT EXISTS recorded_at timestamptz DEFAULT now();

-- Optional: rename old columns if you want consistent naming
ALTER TABLE progress
RENAME COLUMN weight TO old_weight;
ALTER TABLE progress
RENAME COLUMN body_fat TO old_body_fat;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_progress_user_recorded_at ON progress (user_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_progress_recorded_at ON progress (recorded_at);
