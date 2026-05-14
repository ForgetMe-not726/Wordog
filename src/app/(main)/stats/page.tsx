import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">统计</h1>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50">
          <span className="text-4xl">📊</span>
        </div>
        <p className="text-lg font-bold text-gray-700">学习统计</p>
        <p className="text-sm text-gray-400">打卡日历与详细学习数据即将上线</p>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-full max-w-xs mx-auto">
          <div className="h-full w-1/4 bg-gradient-to-r from-green-300 to-emerald-400 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
