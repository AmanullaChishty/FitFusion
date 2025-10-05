interface NutritionSummaryProps {
  totals: {
    total_calories: number;
    total_protein_g: number;
    total_carbs_g: number;
    total_fats_g: number;
  } | null;
}

export default function NutritionSummary({ totals }: NutritionSummaryProps) {
  if (!totals) return null;

  const cards = [
    { label: "Calories", value: `${totals.total_calories} kcal` },
    { label: "Protein", value: `${totals.total_protein_g} g` },
    { label: "Carbs", value: `${totals.total_carbs_g} g` },
    { label: "Fats", value: `${totals.total_fats_g} g` },
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
