import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthDemo() {
  const { user, signUp, signIn, signOut, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 space-y-4">
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button
            onClick={signOut}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </>
      ) : (
        <div className="space-y-2">
          <input
            className="border px-2 py-1 w-full"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border px-2 py-1 w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex space-x-2">
            <button
              onClick={() => signUp(email, password)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Sign Up
            </button>
            <button
              onClick={() => signIn(email, password)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
