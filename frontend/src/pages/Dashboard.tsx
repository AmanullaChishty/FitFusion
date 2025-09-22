// import { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";

// export default function Dashboard() {
//   const { session } = useAuth();
//   const [workouts, setWorkouts] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchWorkouts = async () => {
//       if (!session) return;
//       const token = session.access_token;

//       const res = await fetch(`${import.meta.env.VITE_API_URL}/workouts`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setWorkouts(data);
//       } else {
//         console.error("Failed to fetch workouts");
//       }
//     };

//     fetchWorkouts();
//   }, [session]);

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold">My Workouts</h2>
//       <ul className="list-disc ml-6">
//         {workouts.map((w, i) => (
//           <li key={i}>{w.exercise_name} - {w.sets}x{w.reps}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import { useSession } from "@supabase/auth-helpers-react";
import { fetchProfile, type Profile } from "../services/api";

export default function Dashboard() {
  const session = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Session changed:", session);
    if (!session) return;
    const token = (session as any).access_token;

    const loadProfile = async () => {
      try {
        const data = await fetchProfile(token);
        setProfile(data);
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
            <p><strong>Age:</strong> {profile?.age || "-"}</p>
            <p><strong>Weight:</strong> {profile?.weight || "-"} kg</p>
            <p><strong>Height:</strong> {profile?.height || "-"} cm</p>
            <p><strong>Training Level:</strong> {profile?.training_experience || "-"}</p>
            <p><strong>Gender:</strong> {profile?.gender || "-"}</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold mb-2">Quick Actions</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong><a href="/workouts" className="text-blue-500 hover:underline">View Workouts</a></strong></li>
              <li><strong><a href="/profile" className="text-blue-500 hover:underline">Update Profile</a></strong></li>
              <li><strong><a href="/recommendations" className="text-blue-500 hover:underline">View AI Recommendations</a></strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


