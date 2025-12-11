import { useState } from "react";
import LogWorkoutForm from "../components/LogWorkoutForm";
import WorkoutList from "../components/WorkoutList";
import WorkoutDetail from "../components/WorkoutDetail";
import toast from "react-hot-toast";

export default function WorkoutsPage() {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null
  );
  const [refreshSignal, setRefreshSignal] = useState<number>(0);

  const handleSelectWorkout = (id: string) => {
    console.log("Selected workout ID:", id);
    setSelectedWorkoutId(id);
  };

  const handleBackToList = () => {
    setSelectedWorkoutId(null);
  };

  const handleWorkoutLogged = () => {
    toast.success("Workout logged successfully!");
    // Bump refresh signal so child lists re-fetch
    setRefreshSignal((s) => s + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Workouts</h1>
            <p className="text-sm text-slate-500">
              Log your sessions and review your recent training.
            </p>
          </div>
          <div className="inline-flex items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Training log
          </div>
        </header>


        {!selectedWorkoutId ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Log workout card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Log a new workout
              </h2>
              <p className="mb-4 text-xs text-slate-500">
                Capture today&apos;s session to keep your recommendations
                accurate.
              </p>
              <LogWorkoutForm onSuccess={handleWorkoutLogged} />
            </section>

            {/* Workouts list card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Your logged workouts
              </h2>
              <p className="mb-4 text-xs text-slate-500">
                Tap a workout to see set details and analysis.
              </p>
              <div className="max-h-[480px] overflow-y-auto pr-1">
                <WorkoutList onSelect={handleSelectWorkout} refreshSignal={refreshSignal} />
              </div>
            </section>
          </div>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Workout details
                </h2>
                <p className="text-xs text-slate-500">
                  Review sets, volume, and performance for this session.
                </p>
              </div>
              <button
                onClick={handleBackToList}
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              >
                Back to workouts
              </button>
            </div>

            <WorkoutDetail id={selectedWorkoutId} onBack={handleBackToList} />
          </section>
        )}
      </div>
    </div>
  );
}
