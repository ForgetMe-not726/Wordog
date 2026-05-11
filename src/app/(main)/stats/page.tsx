import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-4xl">📊</p>
        <p className="text-xl font-bold text-gray-800">Statistics</p>
        <p className="text-gray-400">Learning stats and check-in calendar coming soon</p>
      </div>
    </div>
  );
}
