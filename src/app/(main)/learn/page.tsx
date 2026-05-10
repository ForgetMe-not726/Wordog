import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDueReviewsCount } from "@/lib/ebbinghaus";
import Link from "next/link";

export default async function LearnPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const userWords = await prisma.userWord.findMany({
    where: { userId: session.user.id },
    select: { reviewStage: true, nextReviewAt: true },
  });
  const dueCount = getDueReviewsCount(userWords);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Learn</h1>

      <div className="grid gap-3">
        <Link
          href="/learn/new"
          className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div>
            <p className="font-bold text-gray-800">New Words</p>
            <p className="text-sm text-gray-400 mt-1">10~20 new words per day</p>
          </div>
          <span className="text-3xl">📖</span>
        </Link>

        <Link
          href="/learn/review"
          className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div>
            <p className="font-bold text-gray-800">Review</p>
            <p className="text-sm text-gray-400 mt-1">
              {dueCount > 0
                ? `${dueCount} words due for review`
                : "No reviews due"}
            </p>
          </div>
          <span className="text-3xl">{dueCount > 0 ? "🔔" : "✅"}</span>
        </Link>

        <Link
          href="/learn/spelling"
          className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div>
            <p className="font-bold text-gray-800">Spelling</p>
            <p className="text-sm text-gray-400 mt-1">
              Unlocks after 20 words accumulated
            </p>
          </div>
          <span className="text-3xl">✍️</span>
        </Link>

        <Link
          href="/lookup"
          className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div>
            <p className="font-bold text-gray-800">Dictionary</p>
            <p className="text-sm text-gray-400 mt-1">
              Definitions, synonyms, antonyms
            </p>
          </div>
          <span className="text-3xl">🔍</span>
        </Link>
      </div>
    </div>
  );
}
