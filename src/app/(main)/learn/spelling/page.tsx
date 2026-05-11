import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SpellingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-4xl">✍️</p>
        <p className="text-xl font-bold text-gray-800">Spelling Practice</p>
        <p className="text-gray-400">Complete 20 learning or review words to unlock</p>
        <Link href="/learn" className="inline-block bg-green-500 text-white rounded-xl px-8 py-3 font-bold">
          Back to Learn
        </Link>
      </div>
    </div>
  );
}
