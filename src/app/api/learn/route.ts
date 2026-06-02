import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextReviewStage, getNextReviewDate } from "@/lib/ebbinghaus";
import { learnAnswerSchema } from "@/lib/validations";

const SESSION_SIZE = 10;

async function autoCheckIn(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.checkIn.upsert({
    where: { userId_date: { userId, date: today } },
    update: {},
    create: { userId, date: today },
  });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface WordData {
  id: string;
  word: string;
  phonetic: string | null;
  meaning: string;
  example: string | null;
  synonyms: string | null;
  antonyms: string | null;
  confusables: string | null;
  derivatives: string | null;
}

// POST: Start a new learning session. Optional wordBookId in body.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  await autoCheckIn(userId);

  let wordBookId: string | null = null;
  try {
    const body = await request.json();
    wordBookId = body.wordBookId || null;
  } catch {
    // No body or no wordBookId, use all books
  }

  const wordBookFilter = wordBookId ? { wordBookId } : {};

  // Get words stuck at round 1 (meaning) first, filtered by book
  const needMeaningRound = await prisma.userWord.findMany({
    where: {
      userId,
      round: 1,
      status: "learning",
      ...(wordBookId ? { word: { wordBookId } } : {}),
    },
    take: SESSION_SIZE,
    include: { word: true },
  });

  const existingWordIds = needMeaningRound.map((uw) => uw.wordId);

  // Fill remaining slots with brand new words
  const remaining = SESSION_SIZE - needMeaningRound.length;
  let newWords: WordData[] = [];
  if (remaining > 0) {
    newWords = await prisma.word.findMany({
      where: {
        ...wordBookFilter,
        ...(existingWordIds.length > 0
          ? { id: { notIn: existingWordIds } }
          : {}),
        userWords: { none: { userId } },
      },
      take: remaining,
    });

    for (const w of newWords) {
      await prisma.userWord.upsert({
        where: { userId_wordId: { userId, wordId: w.id } },
        update: {},
        create: { userId, wordId: w.id, round: 1, status: "learning" },
      });
    }
  }

  const allWords: WordData[] = [
    ...needMeaningRound.map((uw) => uw.word),
    ...newWords,
  ];

  return NextResponse.json(formatWords(allWords));
}

// PUT: Submit a learning result
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const body = await request.json();
  const parsed = learnAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { wordId, round, correct } = parsed.data;

  await autoCheckIn(userId);

  const userWord = await prisma.userWord.findUnique({
    where: {
      userId_wordId: { userId, wordId },
    },
  });

  if (!userWord)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Record study log
  await prisma.studyRecord.create({
    data: { userId, wordId, round, correct },
  });

  if (round === 3 && correct) {
    const nextStage = getNextReviewStage(0);
    await prisma.userWord.update({
      where: { id: userWord.id },
      data: {
        status: "review",
        reviewStage: nextStage === -1 ? 0 : nextStage,
        nextReviewAt: nextStage === -1 ? null : getNextReviewDate(nextStage),
        learnedAt: new Date(),
        round: 0,
      },
    });

    await prisma.dog.updateMany({
      where: { userId },
      data: { foodCurrency: { increment: 10 } },
    });
  } else if (!correct && (round === 2 || round === 3)) {
    await prisma.userWord.update({
      where: { id: userWord.id },
      data: { round: 1 },
    });
  } else if (round === 1) {
    await prisma.userWord.update({
      where: { id: userWord.id },
      data: { round: correct ? 2 : 1 },
    });
  }

  return NextResponse.json({ success: true });
}

function formatWords(words: WordData[]) {
  return shuffle(
    words.map((w) => {
      const otherMeanings = words
        .filter((o) => o.id !== w.id && o.meaning !== w.meaning)
        .map((o) => o.meaning);
      const distractors = shuffle(otherMeanings).slice(0, 3);

      return {
        id: w.id,
        word: w.word,
        phonetic: w.phonetic,
        meaning: w.meaning,
        example: w.example,
        synonyms: w.synonyms ? JSON.parse(w.synonyms) : [],
        antonyms: w.antonyms ? JSON.parse(w.antonyms) : [],
        confusables: w.confusables ? JSON.parse(w.confusables) : [],
        derivatives: w.derivatives ? JSON.parse(w.derivatives) : [],
        options: shuffle([w.meaning, ...distractors]),
      };
    }),
  );
}
