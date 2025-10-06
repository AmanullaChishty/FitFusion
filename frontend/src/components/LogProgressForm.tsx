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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !bodyFat || !recordedAt) return;

    await onCreate({
      weight_kg: parseFloat(weight),
      body_fat_pct: parseFloat(bodyFat),
      rpe: rpe ? parseInt(rpe) : null,
      notes,
      recorded_at: recordedAt,
    });

    setWeight('');
    setBodyFat('');
    setRpe('');
    setNotes('');
    setRecordedAt('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow-md grid grid-cols-1 md:grid-cols-5 gap-4"
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
        className="border p-2 rounded col-span-1"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white rounded px-4 py-2 col-span-1 hover:bg-blue-600"
      >
        Log
      </button>
    </form>
  );
}
