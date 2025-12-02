import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProgressData {
  recorded_at: string;
  weight_kg: number;
  body_fat_pct: number;
}

interface Props {
  data: ProgressData[];
}

const formatDate = (value: string) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  const dateLabel = formatDate(label);

  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs shadow">
      <p className="mb-1 font-medium text-slate-900">{dateLabel}</p>
      {payload.map((entry: any) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-1 text-slate-500">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-semibold text-slate-900">
            {entry.dataKey === "weight_kg"
              ? `${entry.value} kg`
              : `${entry.value} %`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ProgressChart({ data }: Props) {
  // Sort data by date
  const sortedData = [...data].sort(
    (a, b) =>
      new Date(a.recorded_at).getTime() -
      new Date(b.recorded_at).getTime()
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={sortedData}
        margin={{ top: 16, right: 32, left: 0, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="recorded_at"
          tickFormatter={formatDate}
          tick={{ fontSize: 11, fill: "#64748b" }}
          tickMargin={8}
          axisLine={{ stroke: "#e2e8f0" }}
        />
        <YAxis
          yAxisId="left"
          label={{
            value: "Weight (kg)",
            angle: -90,
            position: "insideLeft",
            offset: 10,
            style: { fill: "#64748b", fontSize: 11 },
          }}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={{ stroke: "#e2e8f0" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{
            value: "Body fat (%)",
            angle: -90,
            position: "insideRight",
            offset: 10,
            style: { fill: "#64748b", fontSize: 11 },
          }}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={{ stroke: "#e2e8f0" }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          height={28}
          wrapperStyle={{ fontSize: 11, color: "#64748b" }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="weight_kg"
          name="Weight (kg)"
          stroke="#10b981" // emerald
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="body_fat_pct"
          name="Body fat (%)"
          stroke="#3b82f6" // blue
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
