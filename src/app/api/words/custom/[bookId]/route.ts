import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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

  await prisma.customWordBook.delete({ where: { id: bookId } });
  return NextResponse.json({ success: true });
}
