import { supabase } from "./supabase";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Get current session from Supabase and verify with backend.
 */
export async function verifyAuth() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("No active session found");
  }

  const token = session.access_token;

  const response = await fetch(`${API_BASE_URL}/auth/test`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Auth verification failed");
  }

  return response.json();
}
