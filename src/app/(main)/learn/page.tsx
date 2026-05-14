import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDueReviewsCount } from "@/lib/ebbinghaus";
import Link from "next/link";
import WordBookList from "./WordBookList";

const cards = [
  {
    href: "/learn/new",
    title: "学新词",
    desc: "每天10~20个新词",
    icon: "📖",
    color: "from-blue-400 to-cyan-500",
    bg: "bg-blue-50",
    shadow: "shadow-blue-200/30",
  },
  {
    href: "/learn/review",
    title: "复习",
    icon: "🔄",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    shadow: "shadow-amber-200/30",
  },
  {
    href: "/learn/spelling",
    title: "拼写",
    desc: "学满20词后解锁",
    icon: "✍️",
    color: "from-purple-400 to-pink-500",
    bg: "bg-purple-50",
    shadow: "shadow-purple-200/30",
  },
  {
    href: "/lookup",
    title: "查词典",
    desc: "搜索任意单词",
    icon: "🔍",
    color: "from-teal-400 to-green-500",
    bg: "bg-teal-50",
    shadow: "shadow-teal-200/30",
  },
];

export default async function LearnPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const userWords = await prisma.userWord.findMany({
    where: { userId: session.user.id },
    select: { reviewStage: true, nextReviewAt: true },
  });
  const dueCount = getDueReviewsCount(userWords);

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">学习</h1>
        <div className="bg-amber-50 rounded-full px-3 py-1 flex items-center gap-1.5">
          <span className="text-sm">🦴</span>
          <span className="text-xs font-bold text-amber-600">赚粮中</span>
        </div>
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          const isReview = card.href === "/learn/review";
          const inside = (
            <>
              <span className="text-3xl">{card.icon}</span>
              <p className="font-bold text-gray-800 text-sm mt-1">{card.title}</p>
              {isReview ? (
                <p className="text-xs text-gray-400 mt-0.5">
                  {dueCount > 0 ? `待复习 ${dueCount} 词` : "暂无复习"}
                </p>
              ) : card.desc ? (
                <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
              ) : null}
              {isReview && dueCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse" />
              )}
            </>
          );

          const className = `relative bg-white rounded-2xl p-4 shadow-sm border border-gray-50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${card.shadow} hover:${card.shadow.split("/")[0]}`;

          return (
            <Link key={card.href} href={card.href} className={className}>
              {inside}
            </Link>
          );
        })}
      </div>

      {/* Word book progress */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>📚</span>
          <span>词库进度</span>
        </h2>
        <WordBookList />
      </div>
    </div>
  );
}
