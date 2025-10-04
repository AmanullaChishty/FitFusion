-- 004_seed_meals.sql

-- Assume 3 fake users exist in auth.users with UUIDs
INSERT INTO meals (user_id, meal_type, food_items, calories, protein_g, carbs_g, fats_g, date)
VALUES
  ('aa2aa513-2095-42e9-b7bf-b40cc29ef42d', 'breakfast', '[{"item":"oats","qty":"50g"}]', 300, 10, 45, 5, '2025-10-01'),
  ('aa2aa513-2095-42e9-b7bf-b40cc29ef42d', 'lunch', '[{"item":"chicken","qty":"200g"}]', 600, 50, 10, 20, '2025-10-01'),

  ('aa2aa513-2095-42e9-b7bf-b40cc29ef42d', 'dinner', '[{"item":"fish","qty":"150g"}]', 450, 35, 0, 15, '2025-10-01'),
  ('aa2aa513-2095-42e9-b7bf-b40cc29ef42d', 'snack', '[{"item":"almonds","qty":"30g"}]', 200, 6, 8, 18, '2025-10-01'),

  ('aa2aa513-2095-42e9-b7bf-b40cc29ef42d', 'breakfast', '[{"item":"eggs","qty":"3"}]', 250, 20, 2, 15, '2025-10-01');
