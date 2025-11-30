import { useState } from "react";
import supabase from "../../services/supabase";

export default function Signup() {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password,options: {
        data: {
          name,
          age,
          gender,
        },
      }, });
    setLoading(false);
    if (error) setError(error.message);
    else alert("Check your email for confirmation link");
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-3 max-w-sm mx-auto p-4">
      <h2 className="text-xl font-bold">Signup</h2>
      <input
        className="border p-2"
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="border p-2"
        type="number"
        placeholder="Age"
        value={age}
        min={10}
        max={100}
        onChange={(e) => setAge(Number(e.target.value))}
        required
      />
      <select
        className="border p-2"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        required
      >
        <option disabled value="">Select gender</option>
        <option value="Male">male</option>
        <option value="Female">female</option>
        <option value="Other">other</option>
      </select>
        <input
          className="border p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          id="password"
          className="border p-2"
          type="password"
          placeholder="Password"
          value={password}
          minLength={8}
          pattern="(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}"
          onChange={(e) => {
            setPassword(e.target.value);
            // re-validate confirm field if present
            const confirm = document.getElementById("confirmPassword") as HTMLInputElement | null;
            if (confirm) {
              if (confirm.value && confirm.value !== e.target.value) confirm.setCustomValidity("Passwords do not match");
              else confirm.setCustomValidity("");
            }
          }}
          required
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            onChange={(e) => {
              const t = e.currentTarget.checked ? "text" : "password";
              const p = document.getElementById("password") as HTMLInputElement | null;
              const c = document.getElementById("confirmPassword") as HTMLInputElement | null;
              if (p) p.type = t;
              if (c) c.type = t;
            }}
          />
          Show password
        </label>

        <input
          id="confirmPassword"
          className="border p-2"
          type="password"
          placeholder="Re-type Password"
          onChange={(e) => {
            const pw = (document.getElementById("password") as HTMLInputElement | null)?.value || "";
            e.currentTarget.setCustomValidity(pw === e.currentTarget.value ? "" : "Passwords do not match");
            }}
            required
          />
          {password && password !== (document.getElementById("confirmPassword") as HTMLInputElement)?.value && (
            <p className="text-red-500 text-sm">Passwords do not match</p>
          )}
          {password && password === (document.getElementById("confirmPassword") as HTMLInputElement)?.value && (
            <p className="text-green-500 text-sm">Passwords match</p>
          )}
        <p className="text-sm text-gray-600">
          Password must be at least 8 characters and include a letter, a number, and a symbol.
        </p>
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}
