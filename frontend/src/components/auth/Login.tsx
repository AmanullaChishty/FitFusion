import { useState } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // reset before each attempt
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="flex flex-col gap-3 max-w-sm mx-auto p-4"
    >
      <h2 className="text-xl font-bold">Login</h2>

      {error && <p className="text-red-500">{error}</p>}

      <input
        className="border p-2 rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        className="border p-2 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p className="text-sm text-gray-600 mt-2">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-green-600 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
