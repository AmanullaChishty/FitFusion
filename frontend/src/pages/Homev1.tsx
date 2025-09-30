import { useEffect, useState } from "react";
import api from "../services/api";

interface Workout {
  id: number;
  name: string;
  sets: number;
  reps: number;
  description: string;
}

export default function Home() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await api.get("/api/v1/workouts");
        setWorkouts(res.data);
      } catch (err) {
        console.error("Error fetching workouts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">
        Fit Fusion
      </h1>

      {loading ? (
        <p className="text-gray-600">Loading workouts...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-gray-800">{workout.name}</h2>
              <p className="text-gray-600">
                {workout.sets} sets × {workout.reps} reps
              </p>
              <p className="text-gray-600">
                Description - {workout.description || "No description available."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
