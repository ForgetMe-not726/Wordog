import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addToBookSchema = z.object({
  wordId: z.string().min(1),
  bookId: z.string().min(1),
});

export async function POST(request: Request) {
  const s = await auth();
  if (!s?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const p = addToBookSchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { wordId, bookId } = p.data;

  // Verify book ownership
  const book = await prisma.customWordBook.findUnique({ where: { id: bookId } });
  if (!book || book.userId !== s.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get the word from main word table
  const word = await prisma.word.findUnique({ where: { id: wordId } });
  if (!word) return NextResponse.json({ error: "Word not found" }, { status: 404 });

  // Check if already in the custom book
  const existing = await prisma.customWord.findFirst({
    where: { word: word.word, wordBookId: bookId },
  });
  if (existing) return NextResponse.json({ error: "Already in book" }, { status: 409 });

  await prisma.customWord.create({
    data: {
      wordBookId: bookId,
      word: word.word,
      phonetic: word.phonetic,
      meaning: word.meaning,
      example: word.example,
    },
  });

  return NextResponse.json({ success: true });
}
