import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleDashboardMenu = () => {
    setIsDashboardOpen((prev) => !prev);
  };

  const closeDashboardMenu = () => {
    setIsDashboardOpen(false);
  };

  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-base font-bold text-emerald-700 tracking-tight"
          >
            FitFusion 🤸
          </Link>
          <span className="hidden text-xs text-slate-500 sm:inline">
            Track workouts · Log meals · Stay on course
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Dashboard Dropdown (click only, works on mobile + desktop) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleDashboardMenu}
                  className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none"
                >
                  Dashboard
                  <svg
                    className={`ml-1 inline-block h-4 w-4 text-slate-500 transition-transform ${
                      isDashboardOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                <div
                  className={`absolute right-0 z-50 mt-2 w-52 origin-top-right transform rounded-xl border border-slate-200 bg-white py-1 text-sm text-slate-700 shadow-lg shadow-slate-200/80 transition-all duration-200
                    ${
                      isDashboardOpen
                        ? "scale-100 opacity-100"
                        : "pointer-events-none scale-95 opacity-0"
                    }`}
                >
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 hover:bg-slate-50"
                    onClick={closeDashboardMenu}
                  >
                    Overview
                  </Link>
                  <Link
                    to="/workouts"
                    className="block px-4 py-2 hover:bg-slate-50"
                    onClick={closeDashboardMenu}
                  >
                    Workouts
                  </Link>
                  <Link
                    to="/meals"
                    className="block px-4 py-2 hover:bg-slate-50"
                    onClick={closeDashboardMenu}
                  >
                    Meals
                  </Link>
                  <Link
                    to="/progress"
                    className="block px-4 py-2 hover:bg-slate-50"
                    onClick={closeDashboardMenu}
                  >
                    Progress
                  </Link>
                  <Link
                    to="/recommendations"
                    className="block px-4 py-2 hover:bg-slate-50"
                    onClick={closeDashboardMenu}
                  >
                    Recommendations
                  </Link>
                </div>
              </div>

              {/* Profile link */}
              <Link
                to="/profile"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Profile
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
