import { useState, useEffect } from "react";
import LogMealForm from "../components/LogMealForm";
import MealList from "../components/MealList";
import NutritionSummary from "../components/NutritionSummary";
import NutritionTrendsChart from "../components/NutritionTrendsChart";
import { getDailyTotals, getRollingAverages } from "../services/mealService";

export default function MealsPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [totals, setTotals] = useState<any | null>(null);
  const [trends, setTrends] = useState<any | null>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [windowDays, setWindowDays] = useState(7);

  const loadNutritionData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const totalsData = await getDailyTotals(token, selectedDate, selectedDate);
    setTotals(totalsData[0]);

    const trendsData = await getRollingAverages(token, windowDays);
    setTrends(Array(trendsData));
  };

  useEffect(() => {
    loadNutritionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, refreshKey, windowDays]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Meals &amp; nutrition
            </h1>
            <p className="text-sm text-slate-500">
              Log your meals, monitor macros, and watch your trends over time.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="hidden sm:inline">View day:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </header>

        {/* Log + summary */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Log meal card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Log a meal
            </h2>
            <p className="mb-4 text-xs text-slate-500">
              Add what you ate today to keep your nutrition insights accurate.
            </p>
            <LogMealForm onMealAdded={() => setRefreshKey((k) => k + 1)} />
          </section>

          {/* Daily summary card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Daily summary
            </h2>
            <p className="mb-4 text-xs text-slate-500">
              Overview of calories and macros for{" "}
              <span className="font-medium">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString()
                  : "today"}
              </span>
              .
            </p>
            <NutritionSummary totals={totals} />
          </section>
        </div>

        {/* Meals list */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Meals for the day
            </h2>
            <p className="text-[11px] text-slate-500">
              Tap an item to review or edit details.
            </p>
          </div>
          <MealList date={selectedDate} refreshKey={refreshKey} />
        </section>

        {/* Trends controls + chart */}
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Nutrition trends
              </h2>
              <p className="text-xs text-slate-500">
                Rolling averages help smooth out daily fluctuations.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Rolling window:</span>
              <select
                value={windowDays}
                onChange={(e) => setWindowDays(parseInt(e.target.value))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <NutritionTrendsChart data={trends} />
          </div>
        </section>
      </div>
    </div>
  );
}
