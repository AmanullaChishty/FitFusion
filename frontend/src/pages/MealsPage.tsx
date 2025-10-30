import { useState, useEffect } from "react";
import LogMealForm from "../components/LogMealForm";
import MealList from "../components/MealList";
import NutritionSummary from "../components/NutritionSummary";
import NutritionTrendsChart from "../components/NutritionTrendsChart";
import { getDailyTotals, getRollingAverages } from "../services/mealService";

export default function MealsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [totals, setTotals] = useState<any | null>(null);
  const [trends, setTrends] = useState<any | null>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [windowDays, setWindowDays] = useState(7);

  const loadNutritionData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const totalsData = await getDailyTotals(token, selectedDate, selectedDate);
    setTotals(totalsData[0]);

    const trendsData = await getRollingAverages(token,windowDays);
    const trendsArray = Array(trendsData);
    setTrends(trendsArray);
  };

  useEffect(() => {
    loadNutritionData();
  }, [selectedDate, refreshKey, windowDays]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Meals & Nutrition</h1>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>

        <LogMealForm onMealAdded={() => setRefreshKey((k) => k + 1)} />
        <NutritionSummary totals={totals} />
        <MealList date={selectedDate} refreshKey={refreshKey}/>

        <div className="flex justify-end space-x-2">
          <label>Rolling Window:</label>
          <select
            value={windowDays}
            onChange={(e) => setWindowDays(parseInt(e.target.value))}
            className="border rounded p-2"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>

        <NutritionTrendsChart data={trends} />
      </div>
    </div>
  );
}
