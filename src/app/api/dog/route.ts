import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccessoryType } from "@/generated/prisma/client";
import {
  computeFullnessConsumption,
  computeMoodChange,
  computeStreak,
} from "@/lib/dog";
import { dogActionSchema } from "@/lib/validations";

// GET: Get dog state with daily update
export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dog = await prisma.dog.findUnique({
    where: { userId: session.user.id },
    include: {
      breed: true,
      accessories: {
        where: { equipped: true },
        include: { accessory: true },
      },
    },
  });

  if (!dog) return NextResponse.json({ error: "No dog found" }, { status: 404 });

  const consumption = computeFullnessConsumption(dog.fullnessUpdatedAt);
  const newFullness = Math.max(0, dog.fullness - consumption);

  const checkIns = await prisma.checkIn.findMany({
    where: { userId: session.user.id },
    select: { date: true },
    orderBy: { date: "desc" },
  });
  const streak = computeStreak(checkIns.map((c) => c.date));
  const moodChange = computeMoodChange(streak, newFullness);
  const newMood = Math.max(0, Math.min(100, dog.mood + moodChange));

  if (newFullness !== dog.fullness || newMood !== dog.mood) {
    await prisma.dog.update({
      where: { id: dog.id },
      data: {
        fullness: newFullness,
        mood: newMood,
        fullnessUpdatedAt: new Date(),
      },
    });
  }

  return NextResponse.json({
    id: dog.id,
    name: dog.name,
    breed: dog.breed,
    foodCurrency: dog.foodCurrency,
    fullness: newFullness,
    mood: newMood,
    equippedAccessories: dog.accessories.map((da) => da.accessory),
    streak,
  });
}

// PUT: Feed / buy accessory / unlock breed / equip
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = dogActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { action, accessoryId, breedId } = parsed.data;
  const dog = await prisma.dog.findUnique({
    where: { userId: session.user.id },
  });
  if (!dog) return NextResponse.json({ error: "No dog found" }, { status: 404 });

  if (action === "feed") {
    try {
      const updated = await prisma.dog.update({
        where: { id: dog.id, foodCurrency: { gte: 10 } },
        data: {
          foodCurrency: { decrement: 10 },
          fullness: Math.min(100, dog.fullness + 30),
          fullnessUpdatedAt: new Date(),
        },
        include: { breed: true },
      });
      return NextResponse.json(updated);
    } catch {
      return NextResponse.json({ error: "Not enough food" }, { status: 400 });
    }
  }

  if (action === "buy_accessory" && accessoryId) {
    const accessory = await prisma.accessory.findUnique({
      where: { id: accessoryId },
    });
    if (!accessory)
      return NextResponse.json({ error: "Accessory not found" }, { status: 404 });

    const existing = await prisma.dogAccessory.findUnique({
      where: { dogId_accessoryId: { dogId: dog.id, accessoryId } },
    });
    if (existing)
      return NextResponse.json({ error: "Already owned" }, { status: 400 });

    try {
      await prisma.dogAccessory.create({
        data: { dogId: dog.id, accessoryId, equipped: true },
      });
      const updated = await prisma.dog.update({
        where: { id: dog.id, foodCurrency: { gte: accessory.price } },
        data: { foodCurrency: { decrement: accessory.price } },
        include: { breed: true },
      });
      return NextResponse.json(updated);
    } catch {
      // Rollback accessory creation if balance insufficient
      await prisma.dogAccessory.delete({
        where: { dogId_accessoryId: { dogId: dog.id, accessoryId } },
      }).catch(() => {});
      return NextResponse.json({ error: "Not enough food" }, { status: 400 });
    }
  }

  if (action === "unlock_breed" && breedId) {
    const breed = await prisma.dogBreed.findUnique({
      where: { id: breedId },
    });
    if (!breed)
      return NextResponse.json({ error: "Breed not found" }, { status: 404 });

    try {
      const updated = await prisma.dog.update({
        where: { id: dog.id, foodCurrency: { gte: breed.unlockCost } },
        data: {
          breedId: breed.id,
          foodCurrency: { decrement: breed.unlockCost },
        },
        include: { breed: true },
      });
      return NextResponse.json(updated);
    } catch {
      return NextResponse.json({ error: "Not enough food" }, { status: 400 });
    }
  }

  if (action === "switch_breed" && breedId) {
    const breed = await prisma.dogBreed.findUnique({ where: { id: breedId } });
    if (!breed)
      return NextResponse.json({ error: "Breed not found" }, { status: 404 });
    if (dog.breedId === breedId)
      return NextResponse.json({ error: "Already this breed" }, { status: 400 });

    const updated = await prisma.dog.update({
      where: { id: dog.id },
      data: { breedId },
      include: { breed: true },
    });
    return NextResponse.json(updated);
  }

  if (action === "equip" && accessoryId) {
    const owned = await prisma.dogAccessory.findUnique({
      where: { dogId_accessoryId: { dogId: dog.id, accessoryId } },
    });
    if (!owned)
      return NextResponse.json({ error: "Accessory not owned" }, { status: 400 });

    const accessory = await prisma.accessory.findUnique({
      where: { id: accessoryId },
    });
    if (!accessory)
      return NextResponse.json({ error: "Accessory not found" }, { status: 404 });

    await prisma.dogAccessory.updateMany({
      where: { dogId: dog.id, accessory: { type: accessory.type } },
      data: { equipped: false },
    });
    await prisma.dogAccessory.update({
      where: { dogId_accessoryId: { dogId: dog.id, accessoryId } },
      data: { equipped: true },
    });
    const updated = await prisma.dog.findUnique({
      where: { id: dog.id },
      include: { breed: true, accessories: { include: { accessory: true } } },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
