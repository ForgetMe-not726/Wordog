import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addWordSchema = z.object({
  customWordId: z.string().min(1),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const s = await auth();
  if (!s?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId } = await params;

  const group = await prisma.wordGroup.findUnique({
    where: { id: groupId },
    include: { wordBook: true },
  });
  if (!group || group.wordBook.userId !== s.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const words = await prisma.wordGroupWord.findMany({
    where: { groupId },
    include: { word: true },
    orderBy: { word: { word: "asc" } },
  });

  return NextResponse.json(words);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const s = await auth();
  if (!s?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId } = await params;

  const group = await prisma.wordGroup.findUnique({
    where: { id: groupId },
    include: { wordBook: true },
  });
  if (!group || group.wordBook.userId !== s.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const p = addWordSchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  // Verify the word belongs to the same book
  const word = await prisma.customWord.findUnique({
    where: { id: p.data.customWordId },
  });
  if (!word || word.wordBookId !== group.wordBookId) {
    return NextResponse.json({ error: "Word not in this book" }, { status: 400 });
  }

  try {
    const gw = await prisma.wordGroupWord.create({
      data: { groupId, customWordId: p.data.customWordId },
      include: { word: true },
    });
    return NextResponse.json(gw);
  } catch {
    return NextResponse.json({ error: "Already in group" }, { status: 409 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const s = await auth();
  if (!s?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId } = await params;
  const { searchParams } = new URL(request.url);
  const gwId = searchParams.get("id");

  if (!gwId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const group = await prisma.wordGroup.findUnique({
    where: { id: groupId },
    include: { wordBook: true },
  });
  if (!group || group.wordBook.userId !== s.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.wordGroupWord.deleteMany({
    where: { id: gwId, groupId },
  });

  return NextResponse.json({ success: true });
}
