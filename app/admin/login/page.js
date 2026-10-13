"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to sign in.");
      router.replace("/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 bg-zinc-50 dark:bg-zinc-950">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-navy-800 bg-white dark:bg-navy-950 p-8 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-electric-600 dark:text-ice-300">NexusStore</p>
        <h1 className="mt-3 text-3xl font-black text-zinc-900 dark:text-white">Admin sign in</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Manage products and review customer orders.</p>
        <label className="block mt-7 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="username" required className="mt-2 w-full rounded-xl border border-zinc-200 dark:border-navy-800 bg-transparent px-4 py-3 outline-none focus:border-electric-500" />
        </label>
        <label className="block mt-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required className="mt-2 w-full rounded-xl border border-zinc-200 dark:border-navy-800 bg-transparent px-4 py-3 outline-none focus:border-electric-500" />
        </label>
        {error && <p className="mt-4 text-sm text-rose-600" role="alert">{error}</p>}
        <button disabled={loading} className="mt-7 w-full rounded-xl bg-electric-600 px-4 py-3 font-bold text-white hover:bg-electric-500 disabled:opacity-60">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
