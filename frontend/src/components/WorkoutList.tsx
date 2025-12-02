import { useEffect, useState } from "react";
import { getWorkouts, type Workout } from "../services/workoutService";

export default function WorkoutList({ onSelect }: { onSelect: (id: string) => void }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filterDate, setFilterDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");
        const data = await getWorkouts(token, filterDate || undefined);
        setWorkouts(data);
      } catch (err: any) {
        setError(err.message || "Failed to load workouts");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filterDate]);

  return (
    <div className="space-y-4">
      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Date Filter */}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-700">
          Filter by date
        </label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
          Loading workouts…
        </div>
      )}

      {/* Empty state */}
      {!loading && workouts.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-xs text-slate-500">
          No workouts found for this date range.
        </div>
      )}

      {/* Desktop / tablet table */}
      {!loading && workouts.length > 0 && (
        <>
          <table className="hidden w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-sm text-slate-800 md:table">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Exercise</th>
                <th className="px-3 py-2 text-left">Sets / Reps</th>
                <th className="px-3 py-2 text-left">Weight (kg)</th>
                <th className="px-3 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((w) => (
                <tr
                  key={w.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {w.created_at
                      ? new Date(w.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-slate-900">
                    {w.exercise_name}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    {w.sets} × {w.reps}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    {w.weight ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <button
                      onClick={() => w.id && onSelect(w.id)}
                      className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile card list */}
          <div className="space-y-3 md:hidden">
            {workouts.map((w) => (
              <button
                key={w.id}
                onClick={() => w.id && onSelect(w.id)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left text-sm text-slate-800 shadow-sm hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500">
                      {w.created_at
                        ? new Date(w.created_at).toLocaleDateString()
                        : "-"}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {w.exercise_name}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-700">
                    {w.sets} × {w.reps}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Weight:{" "}
                    <span className="font-medium">
                      {w.weight != null ? `${w.weight} kg` : "-"}
                    </span>
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Tap to view details →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
