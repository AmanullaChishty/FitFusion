-- exercise_performance_views.sql
-- Purpose: Define helper views for AI progressive overload analysis
-----------------------------
-- 1. Add sets_json column
-----------------------------
ALTER TABLE workouts
ADD COLUMN IF NOT EXISTS sets_json jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN workouts.sets_json IS 'List of sets with weight, reps, and RPE details for AI analysis. Example: [{"set_index":1,"reps":10,"weight_kg":50,"rpe":7}]';

-- 1. Base session-level metrics view
CREATE OR REPLACE VIEW exercise_performance AS
SELECT
  w.id AS session_id,
  w.user_id,
  w.exercise_name,
  w.created_at::timestamptz AS datetime,
  (SELECT MAX((s->>'weight_kg')::numeric)
     FROM jsonb_array_elements(w.sets_json) AS s
     WHERE (s->>'weight_kg') IS NOT NULL) AS top_set_weight_kg,
  (SELECT SUM(((s->>'weight_kg')::numeric * (s->>'reps')::int))
     FROM jsonb_array_elements(w.sets_json) AS s
     WHERE (s->>'weight_kg') IS NOT NULL AND (s->>'reps') IS NOT NULL) AS total_volume_kg,
  (SELECT AVG((s->>'rpe')::numeric)
     FROM jsonb_array_elements(w.sets_json) AS s
     WHERE (s->>'rpe') IS NOT NULL) AS avg_rpe,
  w.is_strength_exercise,
  w.equipment,
  w.notes
FROM workouts w
WHERE w.exercise_name IS NOT NULL;


-- 2. Rolling aggregates view for AI model
CREATE OR REPLACE VIEW exercise_performance_rolling AS
SELECT
  ep.user_id,
  ep.exercise_name,
  ep.session_id AS reference_session_id,
  ep.datetime AS reference_datetime,
  recent.sessions_4,
  recent.sessions_8,
  recent.sessions_12,
  recent.metrics_4,
  recent.metrics_8,
  recent.metrics_12
FROM exercise_performance ep
JOIN LATERAL (
  SELECT
    (SELECT jsonb_agg(e ORDER BY e.datetime DESC)
       FROM (SELECT e.* FROM exercise_performance e
             WHERE e.user_id = ep.user_id AND e.exercise_name = ep.exercise_name
               AND e.datetime <= ep.datetime
             ORDER BY e.datetime DESC LIMIT 4) e) AS sessions_4,
    (SELECT jsonb_agg(e ORDER BY e.datetime DESC)
       FROM (SELECT e.* FROM exercise_performance e
             WHERE e.user_id = ep.user_id AND e.exercise_name = ep.exercise_name
               AND e.datetime <= ep.datetime
             ORDER BY e.datetime DESC LIMIT 8) e) AS sessions_8,
    (SELECT jsonb_agg(e ORDER BY e.datetime DESC)
       FROM (SELECT e.* FROM exercise_performance e
             WHERE e.user_id = ep.user_id AND e.exercise_name = ep.exercise_name
               AND e.datetime <= ep.datetime
             ORDER BY e.datetime DESC LIMIT 12) e) AS sessions_12,
    (SELECT jsonb_build_object(
        'sessions_count', count(*),
        'avg_top_set_weight_kg', avg(top_set_weight_kg),
        'avg_volume_kg', avg(total_volume_kg),
        'avg_rpe', avg(avg_rpe),
        'top_set_weights', jsonb_agg(top_set_weight_kg ORDER BY datetime DESC),
        'avg_rpes', jsonb_agg(avg_rpe ORDER BY datetime DESC)
    )
     FROM (SELECT top_set_weight_kg, total_volume_kg, avg_rpe, datetime
           FROM exercise_performance e2
           WHERE e2.user_id = ep.user_id AND e2.exercise_name = ep.exercise_name
             AND e2.datetime <= ep.datetime
           ORDER BY e2.datetime DESC LIMIT 4) t) AS metrics_4,
    (SELECT jsonb_build_object(
        'sessions_count', count(*),
        'avg_top_set_weight_kg', avg(top_set_weight_kg),
        'avg_volume_kg', avg(total_volume_kg),
        'avg_rpe', avg(avg_rpe),
        'top_set_weights', jsonb_agg(top_set_weight_kg ORDER BY datetime DESC),
        'avg_rpes', jsonb_agg(avg_rpe ORDER BY datetime DESC)
    )
     FROM (SELECT top_set_weight_kg, total_volume_kg, avg_rpe, datetime
           FROM exercise_performance e2
           WHERE e2.user_id = ep.user_id AND e2.exercise_name = ep.exercise_name
             AND e2.datetime <= ep.datetime
           ORDER BY e2.datetime DESC LIMIT 8) t) AS metrics_8,
    (SELECT jsonb_build_object(
        'sessions_count', count(*),
        'avg_top_set_weight_kg', avg(top_set_weight_kg),
        'avg_volume_kg', avg(total_volume_kg),
        'avg_rpe', avg(avg_rpe),
        'top_set_weights', jsonb_agg(top_set_weight_kg ORDER BY datetime DESC),
        'avg_rpes', jsonb_agg(avg_rpe ORDER BY datetime DESC)
    )
     FROM (SELECT top_set_weight_kg, total_volume_kg, avg_rpe, datetime
           FROM exercise_performance e2
           WHERE e2.user_id = ep.user_id AND e2.exercise_name = ep.exercise_name
             AND e2.datetime <= ep.datetime
           ORDER BY e2.datetime DESC LIMIT 12) t) AS metrics_12
) recent ON true;
