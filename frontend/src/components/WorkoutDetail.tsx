import { useEffect, useState } from "react";
import {
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  type Workout,
} from "../services/workoutService";

export default function WorkoutDetail({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<Workout>>({});

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");
        const data = await getWorkoutById(token, id);
        setWorkout(data);
        setForm({
          exercise_name: data.exercise_name,
          sets: data.sets,
          reps: data.reps,
          weight: data.weight ?? null,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load workout");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "sets" || name === "reps" || name === "weight"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  };

  const handleSave = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");
      const updated = await updateWorkout(token, id, form);
      setWorkout(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update workout");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this workout?")) return;
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");
      await deleteWorkout(token, id);
      onBack();
    } catch (err: any) {
      setError(err.message || "Failed to delete workout");
    }
  };

  if (loading)
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm">
        Loading workout…
      </div>
    );

  if (error)
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
        {error}
        <div className="mt-3">
          <button
            onClick={onBack}
            className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            Back
          </button>
        </div>
      </div>
    );

  if (!workout)
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 shadow-sm">
        No workout found.
        <div className="mt-3">
          <button
            onClick={onBack}
            className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-800 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Workout details
          </h2>
          <p className="text-xs text-slate-500">
            Edit or review this training session.
          </p>
        </div>
        <button
          onClick={onBack}
          className="self-start rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
        >
          Back to workouts
        </button>
      </div>

      {/* Error inside detail (for update/delete) */}
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Exercise
            </label>
            <input
              type="text"
              name="exercise_name"
              value={form.exercise_name || ""}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="e.g. Bench Press"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Sets
              </label>
              <input
                type="number"
                name="sets"
                value={form.sets ?? ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                min={1}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Reps
              </label>
              <input
                type="number"
                name="reps"
                value={form.reps ?? ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                min={1}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={form.weight ?? ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                step="0.5"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-500"
            >
              Save changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Exercise</p>
              <p className="text-sm font-medium text-slate-900">
                {workout.exercise_name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Date</p>
              <p className="text-sm text-slate-800">
                {workout.created_at
                  ? new Date(workout.created_at).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Sets</p>
              <p className="text-sm font-medium text-slate-900">
                {workout.sets}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Reps</p>
              <p className="text-sm font-medium text-slate-900">
                {workout.reps}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500">Weight (kg)</p>
              <p className="text-sm font-medium text-slate-900">
                {workout.weight != null ? workout.weight : "-"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-red-500"
            >
              Delete
            </button>
            <button
              onClick={onBack}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
