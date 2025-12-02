// frontend/src/components/Workouts.tsx
import React, { useEffect, useState } from "react";
import { getWorkouts, type Workout } from "../services/workoutService";
import { fetchRecommendations, type Recommendation } from "../services/api";
import { useSession } from "@supabase/auth-helpers-react";

const Workouts: React.FC = () => {
  const session = useSession();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const token = (session as any).access_token as string; // Supabase session type patch
        const workoutData = await getWorkouts(token);
        setWorkouts(workoutData || []);

        const recData = await fetchRecommendations(token);
        setRecommendations(recData?.recommendations || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session]);

  const getSuggestion = (exercise: string): string => {
    const rec = recommendations.find((r) => r.exercise === exercise);
    return rec ? rec.suggestion : "No recommendation yet";
  };

  const hasWorkouts = workouts && workouts.length > 0;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Your workouts
          </h2>
          <p className="text-xs text-slate-500">
            Overview of recent training sessions and AI suggestions.
          </p>
        </div>
        {hasWorkouts && (
          <span className="hidden items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
            {workouts.length} logged
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-32 items-center justify-center text-sm text-slate-500">
          Loading workouts…
        </div>
      ) : !hasWorkouts ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-500">
          No workouts logged yet.
          <br />
          <span className="text-xs text-slate-400">
            Log a workout to start seeing suggestions here.
          </span>
        </div>
      ) : (
        <ul className="space-y-3">
          {workouts.map((w, idx) => (
            <li
              key={idx}
              className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-md sm:p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-xs">
                      🏋️
                    </span>
                    <p className="text-sm font-semibold text-slate-900">
                      {w.exercise_name}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600">
                    Reps:{" "}
                    <span className="font-medium text-slate-800">
                      {w.reps}
                    </span>{" "}
                    · Sets:{" "}
                    <span className="font-medium text-slate-800">
                      {w.sets}
                    </span>
                  </p>
                </div>

                <div className="mt-1 max-w-md text-xs text-slate-600 sm:mt-0 sm:text-right">
                  <p className="mb-1 font-medium text-emerald-700">
                    AI suggestion
                  </p>
                  <p className="text-[11px] text-slate-500 sm:text-xs">
                    {getSuggestion(w.exercise_name)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Workouts;
