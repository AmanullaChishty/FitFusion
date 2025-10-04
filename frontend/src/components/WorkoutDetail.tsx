// frontend/src/components/workouts/WorkoutDetail.tsx
import { useEffect, useState } from "react";
import {
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
  type Workout
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
      [name]: name === "sets" || name === "reps" || name === "weight"
        ? Number(value)
        : value,
    }));
  };

  const handleSave = async () => {
    try {
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
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");
      await deleteWorkout(token, id);
      onBack();
    } catch (err: any) {
      setError(err.message || "Failed to delete workout");
    }
  };

  if (loading) return <p>Loading workout...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!workout) return <p>No workout found.</p>;

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-semibold mb-4">Workout Details</h2>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block font-medium">Exercise</label>
            <input
              type="text"
              name="exercise_name"
              value={form.exercise_name || ""}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block font-medium">Sets</label>
            <input
              type="number"
              name="sets"
              value={form.sets ?? ""}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block font-medium">Reps</label>
            <input
              type="number"
              name="reps"
              value={form.reps ?? ""}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block font-medium">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={form.weight ?? ""}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p>
            <strong>Exercise:</strong> {workout.exercise_name}
          </p>
          <p>
            <strong>Sets:</strong> {workout.sets}
          </p>
          <p>
            <strong>Reps:</strong> {workout.reps}
          </p>
          <p>
            <strong>Weight:</strong> {workout.weight ?? "-"}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {workout.created_at ? new Date(workout.created_at).toLocaleDateString() : "-"}
          </p>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={onBack}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
