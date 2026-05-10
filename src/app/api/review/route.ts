import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextReviewStage, getNextReviewDate } from "@/lib/ebbinghaus";
import { reviewAnswerSchema } from "@/lib/validations";

// GET: Get words due for review
export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const dueWords = await prisma.userWord.findMany({
    where: {
      userId: session.user.id,
      status: "review",
      reviewStage: { gt: 0 },
      nextReviewAt: { lte: now },
    },
    include: { word: true },
    take: 20,
  });

  return NextResponse.json(
    dueWords.map((uw) => ({
      id: uw.word.id,
      word: uw.word.word,
      phonetic: uw.word.phonetic,
      meaning: uw.word.meaning,
      example: uw.word.example,
      synonyms: uw.word.synonyms ? JSON.parse(uw.word.synonyms) : [],
      antonyms: uw.word.antonyms ? JSON.parse(uw.word.antonyms) : [],
      confusables: uw.word.confusables ? JSON.parse(uw.word.confusables) : [],
      derivatives: uw.word.derivatives ? JSON.parse(uw.word.derivatives) : [],
    })),
  );
}

// PUT: Submit review result
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = reviewAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { wordId, correct } = parsed.data;

  const userWord = await prisma.userWord.findUnique({
    where: {
      userId_wordId: { userId: session.user.id, wordId },
    },
  });

  if (!userWord)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Record the review
  await prisma.studyRecord.create({
    data: { userId: session.user.id, wordId, round: 0, correct },
  });

  if (correct) {
    const nextStage = getNextReviewStage(userWord.reviewStage);
    await prisma.userWord.update({
      where: { id: userWord.id },
      data: {
        reviewStage: nextStage === -1 ? 0 : nextStage,
        nextReviewAt: nextStage === -1 ? null : getNextReviewDate(nextStage),
        status: nextStage === -1 ? "mastered" : "review",
      },
    });

    if (nextStage === -1) {
      // Word mastered! Bonus food
      await prisma.dog.updateMany({
        where: { userId: session.user.id },
        data: { foodCurrency: { increment: 5 } },
      });
    }
  } else {
    // Reset to round 1 (meaning choice) so the word re-enters the learning queue
    await prisma.userWord.update({
      where: { id: userWord.id },
      data: { round: 1, status: "learning", reviewStage: 0, nextReviewAt: null },
    });
  }

  return NextResponse.json({ success: true });
}
