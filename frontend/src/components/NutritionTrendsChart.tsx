import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";

interface TrendPoint {
  dates: string; // assuming backend sends a single date string per point
  calories: number;
  protein_avg: number;
  carbs_avg: number;
  fats_avg: number;
}

interface NutritionTrendsChartProps {
  data: TrendPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  const dateLabel = (() => {
    const d = new Date(label);
    return isNaN(d.getTime()) ? label : d.toLocaleDateString();
  })();

  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs shadow">
      <p className="mb-1 font-medium text-slate-900">{dateLabel}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1 text-slate-500">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-semibold text-slate-900">
            {entry.dataKey === "calories" ? `${entry.value} kcal` : `${entry.value} g`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function NutritionTrendsChart({ data }: NutritionTrendsChartProps) {
  console.log("NutritionTrendsChart data:", data);

  const formatXAxis = (value: string) => {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Nutrition trends
          </h2>
          <p className="text-xs text-slate-500">
            Rolling averages over time
          </p>
        </div>
      </div>

      {/* Calories line chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="dates"
              tickFormatter={formatXAxis}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickMargin={8}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: 11, color: "#64748b", paddingBottom: 8 }}
            />
            <Line
              type="monotone"
              dataKey="calories"
              name="Calories"
              stroke="#059669" // emerald
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Macros stacked bar chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="dates"
              tickFormatter={formatXAxis}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickMargin={8}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: 11, color: "#64748b", paddingBottom: 8 }}
            />
            <Bar
              dataKey="protein_avg"
              stackId="a"
              fill="#10b981" // protein - emerald
              name="Protein"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="carbs_avg"
              stackId="a"
              fill="#facc15" // carbs - warm yellow
              name="Carbs"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="fats_avg"
              stackId="a"
              fill="#fb7185" // fats - soft red
              name="Fats"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
