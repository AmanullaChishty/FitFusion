import { useEffect, useState } from "react";
import { getWorkouts,deleteWorkout, type Workout } from "../services/workoutService";
import toast from "react-hot-toast";

type Props = {
  onSelect: (id: string) => void;
  onEdit?: (workout: Workout) => void;
  refreshSignal?: number;
};

export default function WorkoutList({ onSelect, onEdit, refreshSignal }: Props) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filterDate, setFilterDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");
        const data = await getWorkouts(token, filterDate || undefined);
        setWorkouts(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load workouts");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filterDate, refreshSignal]);

  const handleDelete = async (id: string) => {
    console.log("Delete workout", id);
    const confirmDelete = window.confirm("Are you sure you want to delete this workout?");
    if (!confirmDelete) return;
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");
        await deleteWorkout(token,id);
        toast.success("Workout deleted successfully!");
        // Refresh the list after deletion
        setWorkouts((prev) => prev.filter((w) => w.id !== id));
      } catch (err: any) {
        toast.error(err.message || "Failed to delete workouts");
      } finally {
        setDeletingId(null);
      }
  };

  return (
    <div className="space-y-4">

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
                <th className="px-3 py-2 text-left">Actions</th>
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
                  {/* Desktop / tablet icon actions */}
                  <div className="hidden items-center justify-end gap-2 md:flex">
                    {/* Edit */}
                    <button
                      onClick={() => w.id && onSelect(w.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[13px] text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                      aria-label="Edit workout"
                      title="Edit workout"
                      type="button"
                    >
                      ✏️
                    </button>


                    {/* Delete */}
                    <button
                      onClick={() => w.id && handleDelete(w.id)}
                      disabled={deletingId === w.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-100 bg-red-50 text-[13px] text-red-600 shadow-sm hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Delete workout"
                      title="Delete workout"
                      type="button"
                    >
                      {deletingId === w.id ? "…" : "🗑"}
                    </button>
                  </div>
                </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile card list */}
          <div className="space-y-3 md:hidden">
            {workouts.map((w) => (
              <div
                key={w.id}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left text-sm text-slate-800 shadow-sm"
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
                </div>

                {/* Actions row */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => w.id && onSelect(w.id)}
                    className="flex-1 rounded-xl bg-slate-900 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  {/* <button
                    type="button"
                    onClick={() => onEdit && onEdit(w)}
                    className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    Edit
                  </button> */}
                  <button
                    type="button"
                    disabled={deletingId === w.id}
                    onClick={() => w.id && handleDelete(w.id)}
                    className="flex-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-center text-xs font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === w.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
