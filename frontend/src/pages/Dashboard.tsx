import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { fetchProfile, type Profile } from "../services/api";
import { Link } from "react-router-dom";
import NextWorkoutSuggestionCard from "../components/NextWorkoutSuggestionCard";
import Modal from "../components/Modal";
import {
  type NextWorkoutSuggestionResponse,
  type ExerciseAnalysis,
} from "../types/ai";
import {
  getNextWorkoutSuggestions,
  analyzeExercise,
} from "../services/aiService";

export default function Dashboard() {
  const session = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // AI workout suggestions
  const [suggestions, setSuggestions] = useState<
    NextWorkoutSuggestionResponse[]
  >([]);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<ExerciseAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const userId = profile?.id || "";

  useEffect(() => {
    if (!session) return;
    const token = (session as any).access_token;
    localStorage.setItem("token", session.access_token);

    const loadProfile = async () => {
      try {
        const data = await fetchProfile(token);
        setProfile(data);
        localStorage.setItem("profile_data", JSON.stringify(data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [session]);

  const token = localStorage.getItem("token") || "";

  // Fetch AI suggestions once profile is loaded
  useEffect(() => {
    if (!userId) return;
    const fetchSuggestions = async () => {
      try {
        const data = await getNextWorkoutSuggestions(token);
        setSuggestions(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSuggestions();
  }, [userId, token]);

  const handleApply = (suggestion: NextWorkoutSuggestionResponse) => {
    console.log("Apply suggestion:", suggestion);
  };

  const handleIgnore = (suggestion: NextWorkoutSuggestionResponse) => {
    setSuggestions((prev) =>
      prev.filter((s) => s.exercise_name !== suggestion.exercise_name)
    );
  };

  const handleAnalyze = async (exerciseName: string) => {
    if (!userId) return;
    try {
      setAnalyzing(exerciseName);
      const analysis = await analyzeExercise(token, exerciseName);
      if (analysis) {
        setSelectedAnalysis(analysis as unknown as ExerciseAnalysis);
        setModalOpen(true);
      }
    } catch (e) {
      console.error("Analyze error:", e);
    } finally {
      setAnalyzing(null);
    }
  };

  // ---- BMI calculation ----
  const heightM =
    profile?.height && profile.height > 0 ? profile.height / 100 : null;
  const bmi =
    heightM && profile?.weight
      ? profile.weight / (heightM * heightM)
      : null;

  const getBmiCategory = (value: number | null) => {
    if (!value) return "-";
    if (value < 18.5) return "Underweight";
    if (value < 25) return "Normal";
    if (value < 30) return "Overweight";
    return "Obese";
  };

  const bmiCategory = getBmiCategory(bmi);

  // For the chart marker: clamp BMI to a reasonable range (15–35)
  const minBmi = 15;
  const maxBmi = 35;
  const bmiPercent =
    bmi != null
      ? Math.max(
          0,
          Math.min(100, ((bmi - minBmi) / (maxBmi - minBmi)) * 100)
        )
      : 0;

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
        <div className="mx-auto flex max-w-4xl items-center justify-center px-6 py-16">
          <div className="rounded-2xl border border-slate-200 bg-white/70 px-6 py-4 text-sm text-slate-600 shadow-sm">
            Loading your dashboard…
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Welcome back, {profile?.username || "athlete"}
            </h1>
            <p className="text-sm text-slate-500">
              Here’s a snapshot of your training and what to do next.
            </p>
          </div>
          <div className="inline-flex items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Training level:{" "}
            <span className="ml-1 font-semibold">
              {profile?.training_experience || "Not set"}
            </span>
          </div>
        </header>

        {/* Profile + BMI + Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Profile overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Profile overview
            </h2>
            <dl className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium">
                  {profile?.username || profile?.name || "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Age</dt>
                <dd className="font-medium">{profile?.age || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Weight</dt>
                <dd className="font-medium">
                  {profile?.weight ? `${profile.weight} kg` : "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Height</dt>
                <dd className="font-medium">
                  {profile?.height ? `${profile.height} cm` : "-"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Gender</dt>
                <dd className="font-medium">{profile?.gender || "-"}</dd>
              </div>
            </dl>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Quick actions
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/workouts"
                  className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800 hover:bg-emerald-100"
                >
                  <span className="font-medium">View &amp; log workouts</span>
                  <span className="text-xs text-emerald-700">Go →</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/meals"
                  className="flex items-center justify-between rounded-xl bg-sky-50 px-3 py-2 text-sky-800 hover:bg-sky-100"
                >
                  <span className="font-medium">View &amp; log meals</span>
                  <span className="text-xs text-sky-700">Go →</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/progress"
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-slate-800 hover:bg-slate-100"
                >
                  <span className="font-medium">View progress</span>
                  <span className="text-xs text-slate-600">Go →</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/recommendations"
                  className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  <span className="font-medium">AI recommendations</span>
                  <span className="text-xs text-slate-600">Go →</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  <span className="font-medium">Update profile</span>
                  <span className="text-xs text-slate-600">Go →</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* BMI card spanning full width (between the two on larger screens) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  BMI overview
                </h2>
                {bmi ? (
                  <>
                    <p className="mt-1 text-sm text-slate-600">
                      Your body mass index is{" "}
                      <span className="font-semibold text-slate-900">
                        {bmi.toFixed(1)}
                      </span>{" "}
                      –{" "}
                      <span className="font-semibold text-emerald-700">
                        {bmiCategory}
                      </span>
                      .
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      BMI is a rough indicator. Your training history, strength,
                      and how you feel also matter.
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-slate-600">
                    Add your height and weight in your profile to see your BMI.
                  </p>
                )}
              </div>

              {/* Simple BMI bar chart */}
              <div className="w-full max-w-md">
                <div className="mb-1 flex justify-between text-[10px] font-medium text-slate-500">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  {/* colored ranges */}
                  <div className="absolute inset-y-0 left-0 w-[22%] bg-sky-100" />{" "}
                  {/* <18.5 */}
                  <div className="absolute inset-y-0 left-[22%] w-[35%] bg-emerald-100" />{" "}
                  {/* 18.5–25 */}
                  <div className="absolute inset-y-0 left-[57%] w-[21%] bg-amber-100" />{" "}
                  {/* 25–30 */}
                  <div className="absolute inset-y-0 left-[78%] w-[22%] bg-rose-100" />{" "}
                  {/* >30 */}
                  {/* marker */}
                  {bmi && (
                    <div
                      className="absolute inset-y-[-4px] flex items-center"
                      style={{ left: `${bmiPercent}%` }}
                    >
                      <div className="h-5 w-[2px] rounded-full bg-slate-900" />
                    </div>
                  )}
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                  <span>15</span>
                  <span>20</span>
                  <span>25</span>
                  <span>30</span>
                  <span>35</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Next Workout Suggestions */}
        <section className="mt-10">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold text-slate-900">
              Next workout suggestions
            </h2>
            <p className="text-xs text-slate-500">
              Powered by your recent training data.
            </p>
          </div>

          {suggestions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-6 text-sm text-slate-500">
              No suggestions available yet. Log a few workouts to unlock
              personalized guidance.
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((s) => (
                <div
                  key={s.exercise_name}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <NextWorkoutSuggestionCard
                    suggestion={s}
                    onApply={handleApply}
                    onIgnore={handleIgnore}
                  />
                  <button
                    className={`mt-3 inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-xs font-medium
                      ${
                        analyzing === s.exercise_name
                          ? "cursor-not-allowed bg-slate-100 text-slate-400"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    onClick={() => handleAnalyze(s.exercise_name)}
                    disabled={analyzing === s.exercise_name}
                  >
                    {analyzing === s.exercise_name ? (
                      <span className="inline-flex items-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Analyzing…
                      </span>
                    ) : (
                      "Analyze exercise"
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Analysis Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Exercise analysis"
        >
          {selectedAnalysis && (
            <div className="space-y-3 text-sm text-slate-800">
              <p>
                <span className="font-semibold text-slate-900">
                  Recommendation:
                </span>{" "}
                {selectedAnalysis.suggested_action}{" "}
                {selectedAnalysis.numeric_recommendation != null &&
                selectedAnalysis.numeric_recommendation > 0
                  ? `+${selectedAnalysis.numeric_recommendation}`
                  : ""}
              </p>
              <p>
                <span className="font-semibold text-slate-900">
                  Rationale:
                </span>{" "}
                {selectedAnalysis.rationale}
              </p>
              <div>
                <span className="font-semibold text-slate-900">
                  Coaching cues:
                </span>
                <ul className="ml-4 list-disc list-inside text-slate-700">
                  {selectedAnalysis.coaching_cues.map((cue, idx) => (
                    <li key={idx}>{cue}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  Trend metrics:
                </span>
                <ul className="ml-4 list-disc list-inside text-slate-700">
                  <li>
                    Volume slope:{" "}
                    {selectedAnalysis.trend_metrics.volume_slope.toFixed(2)}
                  </li>
                  <li>
                    Top set slope:{" "}
                    {selectedAnalysis.trend_metrics.weight_slope.toFixed(2)}
                  </li>
                  <li>
                    RPE trend:{" "}
                    {selectedAnalysis.trend_metrics.rpe_trend.toFixed(2)}
                  </li>
                  <li>
                    Consistency:{" "}
                    {(
                      selectedAnalysis.trend_metrics.consistency * 100
                    ).toFixed(0)}
                    %
                  </li>
                </ul>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
