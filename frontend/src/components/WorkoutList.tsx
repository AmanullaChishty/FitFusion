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
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");
        const data = await getWorkouts(token, filterDate || undefined);
        console.log("Fetched workouts:", data);
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
    <div>
      {/* <h2 className="text-xl font-semibold mb-4">Your Workouts</h2> */}

      {error && <p className="text-red-500">{error}</p>}

      {/* Date Filter */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Filter by Date</label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border rounded p-2"
        />
      </div>

      {loading ? (
        <p>Loading workouts...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Exercise</th>
              <th className="p-2 border">Sets/Reps</th>
              <th className="p-2 border">Weight (kg)</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map((w) => (
              <tr key={w.id} className="hover:bg-gray-50">
                <td className="p-2 border">
                  {w.created_at ? new Date(w.created_at).toLocaleDateString() : "-"}
                </td>
                <td className="p-2 border">{w.exercise_name}</td>
                <td className="p-2 border">
                  {w.sets} × {w.reps}
                </td>
                <td className="p-2 border">{w.weight ?? "-"}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => w.id && onSelect(w.id)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
