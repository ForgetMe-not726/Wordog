import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeStreak } from "@/lib/dog";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Check-ins from the past year
  const oneYearAgo = new Date(startOfToday);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const checkIns = await prisma.checkIn.findMany({
    where: { userId, date: { gte: oneYearAgo } },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  const checkInSet = new Set(
    checkIns.map((c) => {
      const d = new Date(c.date);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    }),
  );

  const streak = computeStreak(checkIns.map((c) => new Date(c.date)));

  // Word stats
  const [inReview, mastered, total] = await Promise.all([
    prisma.userWord.count({ where: { userId, status: "review" } }),
    prisma.userWord.count({ where: { userId, status: "mastered" } }),
    prisma.userWord.count({ where: { userId } }),
  ]);

  const todayEnd = new Date(startOfToday);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [todayLearned, todayReview, todayTotal] = await Promise.all([
    prisma.studyRecord.count({
      where: { userId, correct: true, round: 3, createdAt: { gte: startOfToday, lt: todayEnd } },
    }),
    prisma.studyRecord.count({
      where: { userId, round: { gt: 3 }, createdAt: { gte: startOfToday, lt: todayEnd } },
    }),
    prisma.studyRecord.count({
      where: { userId, createdAt: { gte: startOfToday, lt: todayEnd } },
    }),
  ]);

  return NextResponse.json({
    checkInDates: Array.from(checkInSet),
    streak,
    stats: {
      learnedWords: inReview + mastered,
      inReview,
      mastered,
      totalEngaged: total,
      todayLearned,
      todayReview,
      todayTotal,
    },
  });
}
