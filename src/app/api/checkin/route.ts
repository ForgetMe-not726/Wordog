import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.checkIn.findUnique({
    where: {
      userId_date: {
        userId: session.user.id,
        date: today,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ checkedIn: true, alreadyCheckedIn: true });
  }

  await prisma.checkIn.create({
    data: {
      userId: session.user.id,
      date: today,
    },
  });

  return NextResponse.json({ checkedIn: true });
}
