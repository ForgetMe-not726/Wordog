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
      setError(data.error || "注册失败");
      setLoading(false);
      return;
    }

    router.push("/auth/login?registered=true");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-orange-50 to-amber-50/30 px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg shadow-orange-100/50 p-8 w-full max-w-sm space-y-4">
        <div className="text-center space-y-1">
          <p className="text-5xl">🐣</p>
          <h1 className="text-xl font-bold text-gray-800">创建账号</h1>
          <p className="text-sm text-gray-400">领养你的单词小狗</p>
        </div>

        {error && (
          <p className="bg-red-50 text-red-500 text-sm text-center rounded-xl py-2">{error}</p>
        )}

        <input
          name="name"
          placeholder="昵称"
          required
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-700 focus:border-orange-400 focus:outline-none transition-colors"
        />
        <input
          name="email"
          type="email"
          placeholder="邮箱"
          required
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-700 focus:border-orange-400 focus:outline-none transition-colors"
        />
        <input
          name="password"
          type="password"
          placeholder="密码（至少6位）"
          required
          minLength={6}
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-700 focus:border-orange-400 focus:outline-none transition-colors"
        />
        <input
          name="dogName"
          placeholder="给小狗起个名字"
          required
          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-700 focus:border-orange-400 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl py-3 font-bold shadow-lg shadow-orange-300/30 hover:shadow-xl hover:shadow-orange-300/40 transition-all disabled:opacity-50 active:scale-95"
        >
          {loading ? "创建中..." : "注册并领养小狗"}
        </button>
        <p className="text-center text-sm text-gray-400">
          已有账号？{" "}
          <Link href="/auth/login" className="text-orange-500 font-bold">登录</Link>
        </p>
      </form>
    </div>
  );
}
