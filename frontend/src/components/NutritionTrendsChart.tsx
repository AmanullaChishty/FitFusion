import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, BarChart, Bar,
  Rectangle,
} from "recharts";

interface NutritionTrendsChartProps {
  data: Array<{ dates: string[]; calories: number; protein_avg: number; carbs_avg: number; fats_avg: number }>;
}


export default function NutritionTrendsChart({ data }: NutritionTrendsChartProps) {
  console.log("NutritionTrendsChart data:", data);
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Nutrition Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dates" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="calories" stroke="#2563eb" name="Calories" />
        </LineChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dates" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="protein_avg" stackId="a" fill="#16a34a" name="Protein" />
          <Bar dataKey="carbs_avg" stackId="a" fill="#f59e0b" name="Carbs" />
          <Bar dataKey="fats_avg" stackId="a" fill="#dc2626" name="Fats" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
