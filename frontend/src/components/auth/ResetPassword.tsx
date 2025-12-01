import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Ensure there is a session created by the recovery link
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setError(
          "This link is invalid or expired. Please request a new password reset."
        );
      }

      setCheckingSession(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Your password has been updated. You can now log in.");
    // Optional: redirect to login after a short delay
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl px-8 py-10">
          {/* Logo / Title */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-2xl bg-emerald-100 border border-emerald-200 px-4 py-2">
              <span className="text-emerald-700 font-semibold text-sm tracking-tight">
                FitFusion
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Reset your password
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Choose a new password to get back into your account.
            </p>
          </div>

          {checkingSession ? (
            <p className="text-sm text-slate-500 text-center">
              Validating reset link...
            </p>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              {!error && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-slate-800"
                    >
                      New password
                    </label>
                    <input
                      id="newPassword"
                      className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmNewPassword"
                      className="block text-sm font-medium text-slate-800"
                    >
                      Confirm new password
                    </label>
                    <input
                      id="confirmNewPassword"
                      className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      type="password"
                      placeholder="Re-type password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Updating password..." : "Update password"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
