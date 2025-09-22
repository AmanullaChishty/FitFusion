import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css'
import { AuthProvider } from "./context/AuthContext";
import { createClient } from "@supabase/supabase-js";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
    <AuthProvider>
      <App />
    </AuthProvider>
    </SessionContextProvider>
  </React.StrictMode>
);
