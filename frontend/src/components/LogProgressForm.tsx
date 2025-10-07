import React, { useState } from 'react';

interface Props {
  onCreate: (payload: any) => void;
}

export default function LogProgressForm({ onCreate }: Props) {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [rpe, setRpe] = useState('');
  const [notes, setNotes] = useState('');
  const [recordedAt, setRecordedAt] = useState('');
  const [strengthMilestones, setStrengthMilestones] = useState({
    bench_press_kg: '',
    squat_kg: '',
    deadlift_kg: '',
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

    setWeight('');
    setBodyFat('');
    setRpe('');
    setNotes('');
    setRecordedAt('');
    setStrengthMilestones({ bench_press_kg: '', squat_kg: '', deadlift_kg: '' });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow-md grid grid-cols-1 md:grid-cols-6 gap-4"
    >
      <input
        type="date"
        value={recordedAt}
        onChange={(e) => setRecordedAt(e.target.value)}
        required
        className="border p-2 rounded col-span-1"
      />
      <input
        type="number"
        placeholder="Weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        required
        className="border p-2 rounded col-span-1"
      />
      <input
        type="number"
        placeholder="Body Fat (%)"
        value={bodyFat}
        onChange={(e) => setBodyFat(e.target.value)}
        required
        className="border p-2 rounded col-span-1"
      />
      <input
        type="number"
        placeholder="RPE"
        value={rpe}
        onChange={(e) => setRpe(e.target.value)}
        className="border p-2 rounded col-span-1"
      />
      <input
        type="text"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border p-2 rounded col-span-2"
      />

      {/* Strength Milestones Section */}
      <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="number"
          placeholder="Bench Press (kg)"
          value={strengthMilestones.bench_press_kg}
          onChange={(e) => handleStrengthChange('bench_press_kg', e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Squat (kg)"
          value={strengthMilestones.squat_kg}
          onChange={(e) => handleStrengthChange('squat_kg', e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Deadlift (kg)"
          value={strengthMilestones.deadlift_kg}
          onChange={(e) => handleStrengthChange('deadlift_kg', e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 md:col-span-1"
      >
        Log
      </button>
    </form>
  );
}
