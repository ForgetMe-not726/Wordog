import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createBookSchema = z.object({
  name: z.string().min(1).max(50),
});

export async function GET() {
  const s = await auth();
  if (!s?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const books = await prisma.customWordBook.findMany({
    where: { userId: s.user.id },
    include: { _count: { select: { words: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(books);
}

export async function POST(request: Request) {
  const s = await auth();
  if (!s?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const p = createBookSchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const book = await prisma.customWordBook.create({
    data: { userId: s.user.id, name: p.data.name },
    include: { _count: { select: { words: true } } },
  });

  return NextResponse.json(book);
}
