import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { fetchProfile, updateProfile, type Profile } from "../services/api";

export default function ProfilePage() {
  const session = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const token = (session as any).access_token;

    const loadProfile = async () => {
      try {
        const data = await fetchProfile(token);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [session]);

  const handleUpdate = async () => {
    if (!profile || !session) return;
    const token = (session as any).access_token;

    try {
      const updated = await updateProfile(token, profile);
      setProfile(updated);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>No profile found.</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Profile</h2>

      <label className="block mb-2">Username:</label>
      <input
        className="border p-2 w-full mb-4"
        value={profile.username || ""}
        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
      />

      <label className="block mb-2">Age:</label>
      <input
        type="number"
        className="border p-2 w-full mb-4"
        value={profile.age || ""}
        onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
      />

      <label className="block mb-2">Weight (kg):</label>
      <input
        type="number"
        className="border p-2 w-full mb-4"
        value={profile.weight || ""}
        onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
      />

      <label className="block mb-2">Height (cm):</label>
      <input
        type="number"
        className="border p-2 w-full mb-4"
        value={profile.height || ""}
        onChange={(e) => setProfile({ ...profile, height: Number(e.target.value) })}
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleUpdate}
      >
        Update
      </button>
    </div>
  );
}
