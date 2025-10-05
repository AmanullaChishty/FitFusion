import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, BarChart, Bar,
} from "recharts";

interface NutritionTrendsChartProps {
  data: Array<{ date: string; calories: number; protein_g: number; carbs_g: number; fats_g: number }>;
}

export default function NutritionTrendsChart({ data }: NutritionTrendsChartProps) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Nutrition Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="calories" stroke="#2563eb" name="Calories" />
        </LineChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="protein_g" stackId="a" fill="#16a34a" name="Protein" />
          <Bar dataKey="carbs_g" stackId="a" fill="#f59e0b" name="Carbs" />
          <Bar dataKey="fats_g" stackId="a" fill="#dc2626" name="Fats" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
