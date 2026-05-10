"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        dogName: form.get("dogName"),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    router.push("/auth/login?registered=true");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-green-800">Create Account</h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input name="name" placeholder="Nickname" required className="w-full border rounded-lg px-4 py-2" />
        <input name="email" type="email" placeholder="Email" required className="w-full border rounded-lg px-4 py-2" />
        <input name="password" type="password" placeholder="Password" required minLength={6} className="w-full border rounded-lg px-4 py-2" />
        <input name="dogName" placeholder="Give your dog a name" required className="w-full border rounded-lg px-4 py-2" />
        <button type="submit" disabled={loading} className="w-full bg-green-500 text-white rounded-lg py-2 font-bold disabled:opacity-50">
          {loading ? "Creating..." : "Sign Up & Adopt a Dog"}
        </button>
        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link href="/auth/login" className="text-green-600">Log in</Link>
        </p>
      </form>
    </div>
  );
}
