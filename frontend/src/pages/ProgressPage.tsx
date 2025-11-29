import { useEffect, useState } from 'react';
import { fetchProgress, createProgress } from '../services/progressService';
import ProgressChart from '../components/ProgressChart';
import LogProgressForm from '../components/LogProgressForm';

export default function ProgressPage() {
  const [data, setData] = useState<any[]>([]);
  const token = localStorage.getItem("token");
  if (!token) throw new Error("User not authenticated");
  useEffect(() => {
    const loadData = async () => {
      const res = await fetchProgress(token);
      setData(res);
    };
    loadData();
  }, []);

  const onCreate = async (payload: any) => {
    await createProgress(token, payload);
    const res = await fetchProgress(token);
    setData(res);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Progress Tracker</h1>
        <LogProgressForm onCreate={onCreate} />
        <div className="mt-8">
          <ProgressChart data={data} />
        </div>
        <div className="mt-8">
          <table className="min-w-full bg-white shadow rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Weight (kg)</th>
                <th className="py-2 px-4">Body Fat (%)</th>
                <th className="py-2 px-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any) => (
                <tr key={row.id} className="border-b">
                  <td className="py-2 px-4">{row.recorded_at}</td>
                  <td className="py-2 px-4">{row.weight_kg}</td>
                  <td className="py-2 px-4">{row.body_fat_pct}</td>
                  <td className="py-2 px-4">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
