import { useState } from "react";
import supabase from "../../services/supabase";
import {Link } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          age,
          gender,
        },
      },
    });

    setLoading(false);

    if (error) setError(error.message);
    else alert("Check your email for confirmation link");
  };

  const passwordsMatch = password !== "" && confirmPassword !== "" && password === confirmPassword;
  const passwordsMismatch = password !== "" && confirmPassword !== "" && password !== confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl px-8 py-10">
          {/* Logo / Title */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-2xl bg-emerald-100 border border-emerald-200 px-4 py-2">
              <span className="text-emerald-700 font-semibold text-sm tracking-tight">
                FitFusion 🤸
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Set up your profile to start tracking workouts and meals.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-800"
              >
                Full name
              </label>
              <input
                id="name"
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                type="text"
                placeholder="Aman"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label
                htmlFor="age"
                className="block text-sm font-medium text-slate-800"
              >
                Age
              </label>
              <input
                id="age"
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                type="number"
                placeholder="29"
                value={age}
                min={10}
                max={100}
                onChange={(e) => {
                  const value = e.target.value;
                  setAge(value === "" ? "" : Number(value));
                }}
                required
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-slate-800"
              >
                Gender
              </label>
              <select
                id="gender"
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={gender}
                onChange={(e) => setGender(e.target.value.toLowerCase())}
                required
              >
                <option disabled value="">
                  Select gender
                </option>
                <option value="Male">male</option>
                <option value="Female">female</option>
                <option value="Other">other</option>
              </select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-800"
              >
                Email
              </label>
              <input
                id="email"
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-800"
              >
                Password
              </label>
              <input
                id="password"
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                type="password"
                placeholder="••••••••"
                value={password}
                minLength={8}
                pattern="(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}"
                onChange={(e) => {
                  const newPassword = e.target.value;
                  setPassword(newPassword);
                }}
                required
              />
              <p className="text-xs text-slate-500">
                At least 8 characters, including a letter, a number, and a
                symbol.
              </p>
            </div>

            {/* Show password */}
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                onChange={(e) => {
                  const t = e.currentTarget.checked ? "text" : "password";
                  const p = document.getElementById(
                    "password"
                  ) as HTMLInputElement | null;
                  const c = document.getElementById(
                    "confirmPassword"
                  ) as HTMLInputElement | null;
                  if (p) p.type = t;
                  if (c) c.type = t;
                }}
              />
              Show password
            </label>

            {/* Confirm password */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-800"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                type="password"
                placeholder="Re-type password"
                value={confirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setConfirmPassword(value);

                  // Optional: keep HTML5 validity in sync with React state
                  if (value && value !== password) {
                    e.currentTarget.setCustomValidity("Passwords do not match");
                  } else {
                    e.currentTarget.setCustomValidity("");
                  }
                }}
                required
              />
              {passwordsMismatch && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-emerald-600">Passwords match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>

          {/* Footer / Login link */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-emerald-700 hover:text-emerald-600 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
