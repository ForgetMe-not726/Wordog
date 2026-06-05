import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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

  await prisma.wordGroup.delete({ where: { id: groupId } });
  return NextResponse.json({ success: true });
}
