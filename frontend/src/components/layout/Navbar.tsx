import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/dashboard" className="text-2xl font-bold text-blue-400">
              FitFusion
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Hover Dropdown */}
                <div className="relative group">
                  <button className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none">
                    Dashboard
                    <svg
                      className="inline-block w-4 h-4 ml-1 transform group-hover:rotate-180 transition-transform"
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
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-200 origin-top-right z-50">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Overview
                    </Link>
                    <Link
                      to="/workouts"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Workouts
                    </Link>
                    <Link
                      to="/meals"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Meals
                    </Link>
                    <Link
                      to="/progress"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Progress
                    </Link>
                    <Link
                      to="/recommendations"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      AI Recommendations
                    </Link>
                  </div>
                </div>

                {/* Profile link */}
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-600"
                >
                  Profile
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
