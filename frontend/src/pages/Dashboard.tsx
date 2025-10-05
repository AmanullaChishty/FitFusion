import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import { useSession } from "@supabase/auth-helpers-react";
import { fetchProfile, type Profile } from "../services/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const session = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="min-h-screen bg-gray-100"><Navbar /><p className="p-4">Loading dashboard...</p></div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {profile?.username || "User"}!
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold mb-2">Profile Info</h2>
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
      </div>
    </div>
  );
}


