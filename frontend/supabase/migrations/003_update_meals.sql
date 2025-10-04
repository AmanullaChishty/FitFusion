-- 003_update_meals.sql

-- 1. Add missing columns
ALTER TABLE meals
  ADD COLUMN IF NOT EXISTS food_items jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS date date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 2. Rename & standardize macros columns
ALTER TABLE meals
  RENAME COLUMN protein TO protein_g;
ALTER TABLE meals
  RENAME COLUMN carbs TO carbs_g;
ALTER TABLE meals
  RENAME COLUMN fat TO fats_g;

-- Adjust types (if already numeric, just alter precision)
ALTER TABLE meals
  ALTER COLUMN protein_g TYPE numeric(6,2) USING protein_g::numeric,
  ALTER COLUMN carbs_g TYPE numeric(6,2) USING carbs_g::numeric,
  ALTER COLUMN fats_g TYPE numeric(6,2) USING fats_g::numeric,
  ALTER COLUMN calories TYPE integer USING calories::integer;

-- 3. Add indexes
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);

-- 4. Create or replace daily totals view
CREATE OR REPLACE VIEW daily_nutrition_totals AS
SELECT
  user_id,
  date,
  SUM(calories) AS total_calories,
  SUM(protein_g) AS total_protein_g,
  SUM(carbs_g) AS total_carbs_g,
  SUM(fats_g) AS total_fats_g
FROM meals
GROUP BY user_id, date;
