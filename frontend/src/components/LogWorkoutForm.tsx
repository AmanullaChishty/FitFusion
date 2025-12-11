import { useState, useMemo  } from "react";
import { createWorkout } from "../services/workoutService";
import { EXERCISES_BY_BODY_PART, type BodyPart } from "../constants/exercises";
import toast from "react-hot-toast";


export default function LogWorkoutForm({ onSuccess }: { onSuccess: () => void }) {
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const bodyPartOrder: BodyPart[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Glutes",
  "Core",
  "FullBody",
  "Cardio",
  "Other"
  ];

  function filterExercises(query: string) {
    const lower = query.toLowerCase();
    const result: Record<BodyPart, string[]> = {} as any;

    bodyPartOrder.forEach((bp) => {
      const exercises = EXERCISES_BY_BODY_PART[bp].filter((name) =>
        name.toLowerCase().includes(lower)
      );
      result[bp] = exercises;
    });

    return result;
  }

  // inside your component:
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(
    () => filterExercises(exerciseName),
    [exerciseName]
  );

  const handleSelect = (name: string) => {
    setExerciseName(name);
    setIsOpen(false);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      toast.error(err.message || "Failed to log workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Exercise Name */}
      <div className="space-y-1 relative">
  <label className="block text-sm font-medium text-slate-800">
    Exercise name
  </label>

  {/* Search input (also shows the selected value) */}
  <input
    type="text"
    value={exerciseName}
    onChange={(e) => {
      setExerciseName(e.target.value);
      if (!isOpen) setIsOpen(true);
    }}
    onFocus={() => setIsOpen(true)}
    required
    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
    placeholder="Start typing to search…"
  />

  {/* Dropdown */}
  {isOpen && (
    <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg text-sm">
      {bodyPartOrder.map((bodyPart) => {
        const exercises = filtered[bodyPart];
        if (!exercises || exercises.length === 0) return null;

        return (
          <div key={bodyPart}>
            <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {bodyPart}
            </div>

            {exercises.map((name) => (
              <button
                key={name}
                type="button"
                className="flex w-full items-center px-3 py-2 text-left hover:bg-emerald-50"
                onClick={() => handleSelect(name)}
              >
                <span className="truncate">{name}</span>
                {exerciseName === name && (
                  <span className="ml-auto text-[10px] uppercase text-emerald-600">
                    Selected
                  </span>
                )}
              </button>
            ))}
          </div>
        );
      })}

      {/* If nothing matches the search */}
      {bodyPartOrder.every(
        (bp) => !filtered[bp] || filtered[bp].length === 0
      ) && (
        <div className="px-3 py-2 text-slate-500">
          No exercises found. Keep typing…
        </div>
      )}
    </div>
  )}
</div>


      {/* Sets */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-800">
          Sets
        </label>
        <input
          type="number"
          value={sets}
          onChange={(e) => setSets(Number(e.target.value))}
          required
          min={1}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder="3"
        />
      </div>

      {/* Reps */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-800">
          Reps per set
        </label>
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
          required
          min={1}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder="8"
        />
      </div>

      {/* Weight */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-800">
          Weight (kg, optional)
        </label>
        <input
          type="number"
          value={weight ?? ""}
          onChange={(e) =>
            setWeight(e.target.value ? Number(e.target.value) : undefined)
          }
          step="0.5"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder="60"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Logging..." : "Log workout"}
      </button>
    </form>
  );
}
