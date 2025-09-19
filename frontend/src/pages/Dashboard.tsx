import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { session } = useAuth();
  const [workouts, setWorkouts] = useState<any[]>([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!session) return;
      const token = session.access_token;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/workouts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setWorkouts(data);
      } else {
        console.error("Failed to fetch workouts");
      }
    };

    fetchWorkouts();
  }, [session]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">My Workouts</h2>
      <ul className="list-disc ml-6">
        {workouts.map((w, i) => (
          <li key={i}>{w.exercise_name} - {w.sets}x{w.reps}</li>
        ))}
      </ul>
    </div>
  );
}
