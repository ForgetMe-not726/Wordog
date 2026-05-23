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
      setError("邮箱或密码错误");
      setLoading(false);
      return;
    }

    router.push("/home");
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg shadow-green-100/50 p-8 w-full max-w-sm space-y-4">
      <div className="text-center space-y-1">
        <p className="text-5xl">🐕</p>
        <h1 className="text-xl font-bold text-gray-800">欢迎回来</h1>
        <p className="text-sm text-gray-400">Wordog 单词小狗</p>
      </div>

      {params.get("registered") && (
        <p className="bg-green-50 text-green-600 text-sm text-center rounded-xl py-2">注册成功，请登录</p>
      )}
      {error && (
        <p className="bg-red-50 text-red-500 text-sm text-center rounded-xl py-2">{error}</p>
      )}

      <input
        name="email"
        type="email"
        placeholder="邮箱"
        required
        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-700 focus:border-green-400 focus:outline-none transition-colors"
      />
      <input
        name="password"
        type="password"
        placeholder="密码"
        required
        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-700 focus:border-green-400 focus:outline-none transition-colors"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl py-3 font-bold shadow-lg shadow-green-300/30 hover:shadow-xl hover:shadow-green-300/40 transition-all disabled:opacity-50 active:scale-95"
      >
        {loading ? "登录中..." : "登录"}
      </button>
      <p className="text-center text-sm text-gray-400">
        还没有账号？{" "}
        <Link href="/auth/register" className="text-green-500 font-bold">注册</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-100 via-green-50 to-amber-50/30 px-4">
      <Suspense fallback={<div className="w-8 h-8 border-3 border-green-300 border-t-green-500 rounded-full animate-spin" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
