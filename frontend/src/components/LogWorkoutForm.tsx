import { useState } from "react";
import { createWorkout } from "../services/workoutService";

export default function LogWorkoutForm({ onSuccess }: { onSuccess: () => void }) {
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      await createWorkout(token, {
        exercise_name: exerciseName,
        sets,
        reps,
        weight: weight ?? null,
      });

      // reset form
      setExerciseName("");
      setSets(0);
      setReps(0);
      setWeight(undefined);

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to log workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md shadow-md">
      {error && <p className="text-red-500">{error}</p>}

      {/* Exercise Name */}
      <div>
        <label className="block font-medium">Exercise Name</label>
        <input
          type="text"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Sets */}
      <div>
        <label className="block font-medium">Sets</label>
        <input
          type="number"
          value={sets}
          onChange={(e) => setSets(Number(e.target.value))}
          required
          min={1}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Reps */}
      <div>
        <label className="block font-medium">Reps</label>
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
          required
          min={1}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Weight */}
      <div>
        <label className="block font-medium">Weight (kg, optional)</label>
        <input
          type="number"
          value={weight ?? ""}
          onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
          step="0.5"
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Logging..." : "Log Workout"}
      </button>
    </form>
  );
}
