import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { fetchProfile, updateProfile, type Profile } from "../services/api";

export default function ProfilePage() {
  const session = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const token = (session as any).access_token as string;

    const loadProfile = async () => {
      try {
        setError(null);
        const data = await fetchProfile(token);
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [session]);

  const handleUpdate = async () => {
    if (!profile || !session) return;
    const token = (session as any).access_token as string;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await updateProfile(token, profile);
      setProfile(updated);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        No profile found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Profile
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm">
            Update your basic details so we can personalize your training and
            nutrition.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
          {error && (
            <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {success}
            </div>
          )}

          <div className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-800">
                Username
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={profile.username || ""}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                placeholder="How should we call you?"
              />
            </div>

            {/* Age, Gender */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-800">
                  Age
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  value={profile.age || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      age: e.target.value
                        ? Number(e.target.value)
                        : (null as any),
                    })
                  }
                  min={0}
                  placeholder="e.g. 28"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-800">
                  Gender
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  value={profile.gender || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      gender: e.target.value.toLowerCase(),
                    })
                  }
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Weight, Height */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-800">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  value={profile.weight || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      weight: e.target.value
                        ? Number(e.target.value)
                        : (null as any),
                    })
                  }
                  min={0}
                  step="0.1"
                  placeholder="e.g. 75.5"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-800">
                  Height (cm)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  value={profile.height || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      height: e.target.value
                        ? Number(e.target.value)
                        : (null as any),
                    })
                  }
                  min={0}
                  step="0.5"
                  placeholder="e.g. 178"
                />
              </div>
            </div>

            {/* Training experience */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-800">
                Training experience
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={profile.training_experience || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    training_experience: e.target.value,
                  })
                }
              >
                <option value="">Select experience level</option>
                <option value="beginner">Beginner</option>
                <option value="amateur">Amateur</option>
                <option value="intermediate">Intermediate</option>
                <option value="experienced">Experienced</option>
              </select>
              <p className="text-xs text-slate-500">
                This helps us tailor difficulty and progression.
              </p>
            </div>

            {/* Save button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {saving ? "Saving…" : "Update profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
