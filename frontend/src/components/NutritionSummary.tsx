interface NutritionSummaryProps {
  totals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
  } | null;
}

export default function NutritionSummary({ totals }: NutritionSummaryProps) {
  if (!totals) return null;
  const cards = [
    { label: "Calories", value: `${totals.calories} kcal` },
    { label: "Protein", value: `${totals.protein_g} g` },
    { label: "Carbs", value: `${totals.carbs_g} g` },
    { label: "Fats", value: `${totals.fats_g} g` },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="p-3 bg-white rounded shadow text-center">
          <p className="font-semibold">{c.label}</p>
          <p className="text-lg text-blue-600">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
