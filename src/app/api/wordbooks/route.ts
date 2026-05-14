import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const books = await prisma.wordBook.findMany({
    include: {
      _count: { select: { words: true } },
    },
    orderBy: { name: "asc" },
  });

  const userWords = await prisma.userWord.findMany({
    where: { userId: session.user.id },
    select: { wordId: true, status: true },
  });

  const learnedWordIds = new Set(
    userWords.filter((uw) => uw.status !== "learning").map((uw) => uw.wordId)
  );

  const wordBookIds = await prisma.word.findMany({
    where: { id: { in: Array.from(learnedWordIds) } },
    select: { id: true, wordBookId: true },
  });

  const learnedPerBook = new Map<string, number>();
  for (const w of wordBookIds) {
    learnedPerBook.set(w.wordBookId, (learnedPerBook.get(w.wordBookId) ?? 0) + 1);
  }

  const result = books.map((book) => {
    const total = book._count.words;
    const learned = learnedPerBook.get(book.id) ?? 0;
    return {
      id: book.id,
      name: book.name,
      description: book.description,
      totalWords: total,
      learnedWords: learned,
      remainingWords: total - learned,
      progress: total > 0 ? Math.round((learned / total) * 100) : 0,
    };
  });

  return NextResponse.json(result);
}
