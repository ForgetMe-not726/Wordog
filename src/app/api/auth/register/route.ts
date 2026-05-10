import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email, password, dogName } = await request.json();

    if (!email || !password || !dogName) {
      return NextResponse.json(
        { error: "Please fill in all required fields" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 400 },
      );
    }

    const passwordHash = await hash(password, 12);
    const defaultBreed = await prisma.dogBreed.findFirst({
      where: { isDefault: true },
    });

    if (!defaultBreed) {
      return NextResponse.json(
        { error: "No default dog breed found. Run seed first." },
        { status: 500 },
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        dog: {
          create: {
            name: dogName,
            breedId: defaultBreed.id,
          },
        },
      },
    });

    return NextResponse.json({ userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
