import { useEffect, useState } from "react";
import { fetchProgress, createProgress } from "../services/progressService";
import ProgressChart from "../components/ProgressChart";
import LogProgressForm from "../components/LogProgressForm";

export default function ProgressPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthError("You need to be logged in to view progress.");
        setLoading(false);
        return;
      }
      const res = await fetchProgress(token);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onCreate = async (payload: any) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthError("You need to be logged in to log progress.");
      return;
    }
    await createProgress(token, payload);
    const res = await fetchProgress(token);
    setData(res);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Progress tracker
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Log your body metrics and visualize how you’re changing over time.
            </p>
          </div>
        </div>

        {authError && (
          <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {authError}
          </div>
        )}

        {/* Layout: form + chart */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
          {/* Log progress card */}
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Log new entry
            </h2>
            <LogProgressForm onCreate={onCreate} />
          </div>

          {/* Chart card */}
          <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Weight & body fat trends
                </h2>
                <p className="text-xs text-slate-500">
                  Track your progress across all logged entries.
                </p>
              </div>
            </div>
            {loading ? (
              <div className="flex h-60 items-center justify-center text-sm text-slate-500">
                Loading progress…
              </div>
            ) : data.length === 0 ? (
              <div className="flex h-60 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center text-xs text-slate-500">
                No progress entries yet. Log your first entry to see charts.
              </div>
            ) : (
              <div className="h-72">
                <ProgressChart data={data} />
              </div>
            )}
          </div>
        </div>

        {/* Table card */}
        <div className="mt-8 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Progress history
            </h2>
            {data.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                {data.length} entries
              </span>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading entries…</p>
          ) : data.length === 0 ? (
            <p className="text-sm text-slate-500">
              No entries logged yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <div className="max-h-[360px] overflow-y-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Weight (kg)</th>
                      <th className="px-4 py-3">Body fat (%)</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {data.map((row: any) => (
                      <tr key={row.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-2.5 text-xs text-slate-700">
                          {row.recorded_at
                            ? new Date(row.recorded_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-2.5 text-sm font-medium text-slate-900">
                          {row.weight_kg ?? "-"}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-slate-800">
                          {row.body_fat_pct != null
                            ? `${row.body_fat_pct}%`
                            : "-"}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-600">
                          {row.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
