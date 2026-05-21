import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SPELLING_MIN_WORDS = 20;
const SPELLING_BATCH = 10;

const spellingAnswerSchema = z.object({
  wordId: z.string().min(1),
  answer: z.string(),
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function safeJsonParse(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

interface SpellingWord {
  id: string;
  word: string;
  phonetic: string | null;
  meaning: string;
  pos: string | null;
  meaningText: string | null;
  example: string | null;
  synonyms: string[];
  antonyms: string[];
  confusables: string[];
  derivatives: string[];
}

function parseMeaning(raw: string): { pos: string | null; text: string } {
  const m = raw.match(/^([a-z]+\.)\s*(.+)/i);
  if (m) return { pos: m[1], text: m[2] };
  return { pos: null, text: raw };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const learnedWords = await prisma.userWord.findMany({
    where: {
      userId,
      status: { in: ["review", "mastered"] },
    },
    include: {
      word: true,
    },
  });

  const shuffled = shuffle(learnedWords).slice(0, SPELLING_BATCH);

  if (shuffled.length < 3) {
    return NextResponse.json({
      unlocked: false,
      total: shuffled.length,
      required: SPELLING_MIN_WORDS,
    });
  }

  const words: SpellingWord[] = shuffled.map((uw) => {
    const w = uw.word;
    const parsed = parseMeaning(w.meaning);
    return {
      id: uw.wordId,
      word: w.word,
      phonetic: w.phonetic,
      meaning: w.meaning,
      pos: parsed.pos,
      meaningText: parsed.text,
      example: w.example,
      synonyms: safeJsonParse(w.synonyms),
      antonyms: safeJsonParse(w.antonyms),
      confusables: safeJsonParse(w.confusables),
      derivatives: safeJsonParse(w.derivatives),
    };
  });

  return NextResponse.json({ unlocked: true, words, total: shuffled.length });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = spellingAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { wordId, answer } = parsed.data;
  const userId = session.user.id;

  const word = await prisma.word.findUnique({
    where: { id: wordId },
    select: { word: true },
  });

  if (!word) {
    return NextResponse.json({ error: "Word not found" }, { status: 404 });
  }

  const correct = answer.trim().toLowerCase() === word.word.toLowerCase();

  // Record the spelling attempt
  await prisma.studyRecord.create({
    data: { userId, wordId, round: 4, correct },
  });

  return NextResponse.json({ correct, actualWord: word.word });
}
