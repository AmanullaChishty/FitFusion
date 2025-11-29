import { useState } from "react";
import LogWorkoutForm from "../components/LogWorkoutForm";
import WorkoutList from "../components/WorkoutList";
import WorkoutDetail from "../components/WorkoutDetail";

export default function WorkoutsPage() {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSelectWorkout = (id: string) => {
    console.log("Selected workout ID:", id);
    setSelectedWorkoutId(id);
  };

  const handleBackToList = () => {
    setSelectedWorkoutId(null);
  };

  const handleWorkoutLogged = () => {
    // show success alert
    setSuccessMessage("Workout logged successfully!");
    // auto-dismiss after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Workouts</h1>

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded">
          {successMessage}
        </div>
      )}

      {!selectedWorkoutId ? (
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-semibold mb-2">Log a New Workout</h2>
            <LogWorkoutForm onSuccess={handleWorkoutLogged} />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Your Logged Workouts</h2>
            <WorkoutList onSelect={handleSelectWorkout} />
          </div>
        </div>
      ) : (
        <WorkoutDetail id={selectedWorkoutId} onBack={handleBackToList} />
      )}
    </div>
  );
}
