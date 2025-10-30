import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { fetchProfile, type Profile } from "../services/api";
import { Link } from "react-router-dom";
import NextWorkoutSuggestionCard from "../components/NextWorkoutSuggestionCard";
import Modal from "../components/Modal";
import { type NextWorkoutSuggestionResponse, type ExerciseAnalysis } from "../types/ai";
import { getNextWorkoutSuggestions, analyzeExercise } from "../services/aiService";

export default function Dashboard() {
  const session = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // AI workout suggestions
  const [suggestions, setSuggestions] = useState<NextWorkoutSuggestionResponse[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ExerciseAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const userId = profile?.id || "";

  useEffect(() => {
    console.log("Session changed:", session);
    if (!session) return;
    const token = (session as any).access_token;
    localStorage.setItem("token", session.access_token);

    const loadProfile = async () => {
      try {
        const data = await fetchProfile(token);
        setProfile(data);
        localStorage.setItem("profile_data", JSON.stringify(data));
        console.log("Fetched profile:", data);
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
    const fetchSuggestions = async () => {
      const data = await getNextWorkoutSuggestions(token);
      setSuggestions(data);
    };
    fetchSuggestions();
  }, [userId]);

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
      setSelectedAnalysis(analysis as ExerciseAnalysis);
      setModalOpen(true);
    }
  } catch (e) {
    console.error("Analyze error:", e);
  } finally {
    setAnalyzing(null);
  }
};

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100">
        <p className="p-4">Loading dashboard...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile + Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-bold mb-2">Profile Info</h2>
            <p>
              <strong>Name:</strong> {profile?.username || "-"}
            </p>
            <p>
              <strong>Age:</strong> {profile?.age || "-"}
            </p>
            <p>
              <strong>Weight:</strong> {profile?.weight || "-"} kg
            </p>
            <p>
              <strong>Height:</strong> {profile?.height || "-"} cm
            </p>
            <p>
              <strong>Training Level:</strong>{" "}
              {profile?.training_experience || "-"}
            </p>
            <p>
              <strong>Gender:</strong> {profile?.gender || "-"}
            </p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold mb-2">Quick Actions</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>
                  <Link
                    to="/workouts"
                    className="text-blue-500 hover:underline"
                  >
                    View & Log Workouts
                  </Link>
                </strong>
              </li>
              <li>
                <strong>
                  <Link to="/meals" className="text-blue-500 hover:underline">
                    View & Log Meals
                  </Link>
                </strong>
              </li>
              <li>
                <strong>
                  <Link to="/profile" className="text-blue-500 hover:underline">
                    Update Profile
                  </Link>
                </strong>
              </li>
              <li>
                <strong>
                  <Link
                    to="/progress"
                    className="text-blue-500 hover:underline"
                  >
                    Progress
                  </Link>
                </strong>
              </li>
              <li>
                <strong>
                  <Link
                    to="/recommendations"
                    className="text-blue-500 hover:underline"
                  >
                    View AI Recommendations
                  </Link>
                </strong>
              </li>
            </ul>
          </div>
        </div>

        {/* AI Next Workout Suggestions */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Next Workout Suggestions</h2>
          {suggestions.length === 0 && <p>No suggestions available yet.</p>}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((s) => (
              <div key={s.exercise_name}>
                <NextWorkoutSuggestionCard
                  suggestion={s}
                  onApply={handleApply}
                  onIgnore={handleIgnore}
                />
                <button
  className={`mt-2 text-sm underline px-3 py-2 rounded 
             ${analyzing === s.exercise_name
               ? "bg-gray-300 text-gray-600 cursor-not-allowed"
               : "text-blue-500 hover:text-blue-600 bg-transparent"}`}
  onClick={() => handleAnalyze(s.exercise_name)}
  disabled={analyzing === s.exercise_name}
>
  {analyzing === s.exercise_name ? (
    <span className="inline-flex items-center gap-2">
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      Analyzing…
    </span>
  ) : (
    "Analyze Exercise"
  )}
</button>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Exercise Analysis"
        >
          {selectedAnalysis && (
            <div className="space-y-2">
              <p>
                <strong>Recommendation:</strong>{" "}
                {selectedAnalysis.suggested_action}{" "}
                {selectedAnalysis.numeric_recommendation != null && selectedAnalysis.numeric_recommendation > 0
                  ? `+${selectedAnalysis.numeric_recommendation}`
                  : ""}
              </p>
              <p>
                <strong>Rationale:</strong> {selectedAnalysis.rationale}
              </p>
              <div>
                <strong>Coaching Cues:</strong>
                <ul className="list-disc list-inside ml-4">
                  {selectedAnalysis.coaching_cues.map((cue, idx) => (
                    <li key={idx}>{cue}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Metrics:</strong>
                <ul className="list-disc list-inside ml-4">
                  <li>Volume Slope: {selectedAnalysis.trend_metrics.volume_slope.toFixed(2)}</li>
                  <li>Top Set Slope: {selectedAnalysis.trend_metrics.weight_slope.toFixed(2)}</li>
                  <li>RPE Trend: {selectedAnalysis.trend_metrics.rpe_trend.toFixed(2)}</li>
                  <li>Consistency: {(selectedAnalysis.trend_metrics.consistency * 100).toFixed(0)}%</li>
                </ul>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
