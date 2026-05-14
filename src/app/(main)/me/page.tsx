import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">我的</h1>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 space-y-3">
        {session?.user ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-200 to-emerald-300 flex items-center justify-center text-xl">
                🐾
              </div>
              <div>
                <p className="text-gray-700 font-bold">{session.user.name ?? "User"}</p>
                <p className="text-gray-400 text-xs">{session.user.email}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center">未登录</p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 space-y-3">
        <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
          <span>⚙️</span> 设置
        </p>
        <div className="space-y-2 text-sm text-gray-400">
          <p>· 提醒设置 (即将上线)</p>
          <p>· 学习目标 (即将上线)</p>
          <p>· 数据导出 (即将上线)</p>
        </div>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/auth/login" });
        }}
      >
        <button
          type="submit"
          className="w-full bg-red-50 text-red-400 rounded-2xl py-3 font-bold hover:bg-red-100 transition-colors border border-red-100"
        >
          退出登录
        </button>
      </form>
    </div>
  );
}
