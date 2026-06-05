import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(1).max(50),
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

  const groups = await prisma.wordGroup.findMany({
    where: { wordBookId: bookId },
    include: { _count: { select: { words: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(groups);
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
  const p = createGroupSchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const group = await prisma.wordGroup.create({
    data: { wordBookId: bookId, name: p.data.name },
    include: { _count: { select: { words: true } } },
  });

  return NextResponse.json(group);
}
