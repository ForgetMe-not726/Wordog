"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/home");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-center text-green-800">Welcome Back</h1>
      {params.get("registered") && <p className="text-green-500 text-sm text-center">Registration successful! Please log in.</p>}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <input name="email" type="email" placeholder="Email" required className="w-full border rounded-lg px-4 py-2" />
      <input name="password" type="password" placeholder="Password" required className="w-full border rounded-lg px-4 py-2" />
      <button type="submit" disabled={loading} className="w-full bg-green-500 text-white rounded-lg py-2 font-bold disabled:opacity-50">
        {loading ? "Logging in..." : "Log In"}
      </button>
      <p className="text-center text-sm text-gray-500">
        Don't have an account? <Link href="/auth/register" className="text-green-600">Sign up</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
