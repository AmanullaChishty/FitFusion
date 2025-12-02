import React, { useState } from "react";

interface Props {
  onCreate: (payload: any) => void;
}

export default function LogProgressForm({ onCreate }: Props) {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [rpe, setRpe] = useState("");
  const [notes, setNotes] = useState("");
  const [recordedAt, setRecordedAt] = useState("");
  const [strengthMilestones, setStrengthMilestones] = useState({
    bench_press_kg: "",
    squat_kg: "",
    deadlift_kg: "",
  });

  const handleStrengthChange = (field: string, value: string) => {
    setStrengthMilestones((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !bodyFat || !recordedAt) return;

    await onCreate({
      weight_kg: parseFloat(weight),
      body_fat_pct: parseFloat(bodyFat),
      rpe: rpe ? parseInt(rpe) : 0,
      notes,
      recorded_at: new Date(recordedAt).toISOString(),
      strength_milestones: {
        bench_press_kg: strengthMilestones.bench_press_kg
          ? parseFloat(strengthMilestones.bench_press_kg)
          : 0,
        squat_kg: strengthMilestones.squat_kg
          ? parseFloat(strengthMilestones.squat_kg)
          : 0,
        deadlift_kg: strengthMilestones.deadlift_kg
          ? parseFloat(strengthMilestones.deadlift_kg)
          : 0,
      },
    });

    setWeight("");
    setBodyFat("");
    setRpe("");
    setNotes("");
    setRecordedAt("");
    setStrengthMilestones({
      bench_press_kg: "",
      squat_kg: "",
      deadlift_kg: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Top metrics row: more space for each field */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Date */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-800">
            Date
          </label>
          <input
            type="date"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Weight */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-800">
            Weight (kg)
          </label>
          <input
            type="number"
            placeholder="e.g. 75"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            min={0}
            step="0.1"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Body fat */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-800">
            Body fat (%)
          </label>
          <input
            type="number"
            placeholder="e.g. 18"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            required
            min={0}
            step="0.1"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* RPE */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-800">
            RPE (1–10)
          </label>
          <input
            type="number"
            placeholder="Optional"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            min={1}
            max={10}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-800">
          Notes
        </label>
        <textarea
          placeholder="How did today feel? Sleep, energy, training notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* Strength milestones */}
      <div className="space-y-2 rounded-xl bg-slate-50/80 p-3">
        <p className="text-xs font-medium text-slate-700">
          Strength milestones{" "}
          <span className="font-normal text-slate-400">(kg, optional)</span>
        </p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Bench press (kg)
            </label>
            <input
              type="number"
              placeholder="e.g. 80"
              value={strengthMilestones.bench_press_kg}
              onChange={(e) =>
                handleStrengthChange("bench_press_kg", e.target.value)
              }
              min={0}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Squat (kg)
            </label>
            <input
              type="number"
              placeholder="e.g. 100"
              value={strengthMilestones.squat_kg}
              onChange={(e) =>
                handleStrengthChange("squat_kg", e.target.value)
              }
              min={0}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Deadlift (kg)
            </label>
            <input
              type="number"
              placeholder="e.g. 120"
              value={strengthMilestones.deadlift_kg}
              onChange={(e) =>
                handleStrengthChange("deadlift_kg", e.target.value)
              }
              min={0}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex w-full justify-end">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-300 md:w-auto"
        >
          Log entry
        </button>
      </div>
    </form>
  );
}
