import { createClient } from '@supabase/supabase-js';

// Read from Vite env (VITE_ prefix is required in frontend)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create a single client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Supabase auto-stores session in localStorage
    detectSessionInUrl: true,
  },
});

export default supabase;
