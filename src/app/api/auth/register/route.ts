import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, email, password, dogName } = parsed.data;

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
  } catch (e) {
    console.error("Register error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
