import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ProgressData {
  recorded_at: string;
  weight_kg: number;
  body_fat_pct: number;
}

interface Props {
  data: ProgressData[];
}

export default function ProgressChart({ data }: Props) {
  // Sort data by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={sortedData} margin={{ top: 20, right: 40, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="recorded_at" />
        <YAxis
          yAxisId="left"
          label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', offset: 10 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: 'Body Fat (%)', angle: -90, position: 'insideRight', offset: 10 }}
        />
        <Tooltip />
        <Legend verticalAlign="top" height={36} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="weight_kg"
          name="Weight (kg)"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="body_fat_pct"
          name="Body Fat (%)"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
