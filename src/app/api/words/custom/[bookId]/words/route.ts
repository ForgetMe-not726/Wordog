import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addWordSchema = z.object({
  word: z.string().min(1),
  phonetic: z.string().optional(),
  meaning: z.string().min(1),
  example: z.string().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const s = await auth();
  if (!s?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookId } = await params;
  const book = await prisma.customWordBook.findUnique({ where: { id: bookId } });
  if (!book || book.userId !== s.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const words = await prisma.customWord.findMany({
    where: { wordBookId: bookId },
    orderBy: { word: "asc" },
  });

  return NextResponse.json(words);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const s = await auth();
  if (!s?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookId } = await params;
  const book = await prisma.customWordBook.findUnique({ where: { id: bookId } });
  if (!book || book.userId !== s.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const p = addWordSchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  try {
    const word = await prisma.customWord.create({
      data: { wordBookId: bookId, ...p.data },
    });
    return NextResponse.json(word);
  } catch {
    return NextResponse.json({ error: "Word already exists" }, { status: 409 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const s = await auth();
  if (!s?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookId } = await params;
  const { searchParams } = new URL(request.url);
  const wordId = searchParams.get("wordId");

  if (!wordId) return NextResponse.json({ error: "Missing wordId" }, { status: 400 });

  const book = await prisma.customWordBook.findUnique({ where: { id: bookId } });
  if (!book || book.userId !== s.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.customWord.deleteMany({
    where: { id: wordId, wordBookId: bookId },
  });

  return NextResponse.json({ success: true });
}
