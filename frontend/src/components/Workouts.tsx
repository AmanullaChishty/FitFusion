// frontend/src/components/Workouts.tsx
import React, { useEffect, useState } from "react";
import { fetchWorkouts, fetchRecommendations, type Workout, type Recommendation } from "../services/api";
import { useSession } from "@supabase/auth-helpers-react";

const Workouts: React.FC = () => {
  const session = useSession();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (!session) return;

    const loadData = async () => {
      try {
        const token = (session as any).access_token as string; // Supabase session type patch
        const workoutData = await fetchWorkouts(token);
        setWorkouts(workoutData);

        const recData = await fetchRecommendations(token);
        setRecommendations(recData.recommendations);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    loadData();
  }, [session]);

  const getSuggestion = (exercise: string): string => {
    const rec = recommendations.find((r) => r.exercise === exercise);
    return rec ? rec.suggestion : "No recommendation yet";
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Your Workouts</h2>
      {workouts.length === 0 && <p>No workouts logged yet.</p>}
      <ul className="space-y-4">
        {workouts.map((w, idx) => (
          <li key={idx} className="p-4 border rounded-lg shadow-sm">
            <p className="font-medium">{w.exercise}</p>
            <p>
              Reps: {w.reps}, Sets: {w.sets}
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Suggestion: {getSuggestion(w.exercise)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Workouts;
