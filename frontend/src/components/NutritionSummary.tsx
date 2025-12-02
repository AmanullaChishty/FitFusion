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
    {
      label: "Calories",
      value: `${totals.calories} kcal`,
      hint: "Daily energy",
      icon: "🔥",
    },
    {
      label: "Protein",
      value: `${totals.protein_g} g`,
      hint: "Muscle support",
      icon: "💪",
    },
    {
      label: "Carbs",
      value: `${totals.carbs_g} g`,
      hint: "Primary fuel",
      icon: "⚡",
    },
    {
      label: "Fats",
      value: `${totals.fats_g} g`,
      hint: "Long-term energy",
      icon: "🥑",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <span className="text-base leading-none group-hover:scale-110">
              {card.icon}
            </span>
          </div>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-emerald-500/70 group-hover:bg-emerald-600" />
          </div>
        </div>
      ))}
    </div>
  );
}
