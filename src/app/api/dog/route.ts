import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccessoryType } from "@/generated/prisma/client";
import {
  computeFullnessConsumption,
  computeMoodChange,
  computeStreak,
} from "@/lib/dog";

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

  // Calculate daily consumption since last state
  const consumption = computeFullnessConsumption(dog.createdAt);
  const newFullness = Math.max(0, dog.fullness - consumption);

  // Calculate streak for mood
  const checkIns = await prisma.checkIn.findMany({
    where: { userId: session.user.id },
    select: { date: true },
    orderBy: { date: "desc" },
  });
  const streak = computeStreak(checkIns.map((c) => c.date));
  const moodChange = computeMoodChange(streak, newFullness);
  const newMood = Math.max(0, Math.min(100, dog.mood + moodChange));

  // Persist updated values
  if (newFullness !== dog.fullness || newMood !== dog.mood) {
    await prisma.dog.update({
      where: { id: dog.id },
      data: { fullness: newFullness, mood: newMood },
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

  const { action, accessoryId, breedId } = await request.json();
  const dog = await prisma.dog.findUnique({
    where: { userId: session.user.id },
  });
  if (!dog) return NextResponse.json({ error: "No dog found" }, { status: 404 });

  // Feed: cost 10 food currency, restore 30 fullness
  if (action === "feed") {
    if (dog.foodCurrency < 10)
      return NextResponse.json({ error: "Not enough food" }, { status: 400 });
    const updated = await prisma.dog.update({
      where: { id: dog.id },
      data: {
        foodCurrency: dog.foodCurrency - 10,
        fullness: Math.min(100, dog.fullness + 30),
      },
      include: { breed: true },
    });
    return NextResponse.json(updated);
  }

  // Buy an accessory
  if (action === "buy_accessory" && accessoryId) {
    const accessory = await prisma.accessory.findUnique({
      where: { id: accessoryId },
    });
    if (!accessory)
      return NextResponse.json({ error: "Accessory not found" }, { status: 404 });
    if (dog.foodCurrency < accessory.price)
      return NextResponse.json({ error: "Not enough food" }, { status: 400 });

    const existing = await prisma.dogAccessory.findUnique({
      where: {
        dogId_accessoryId: { dogId: dog.id, accessoryId },
      },
    });
    if (existing)
      return NextResponse.json({ error: "Already owned" }, { status: 400 });

    await prisma.dogAccessory.create({
      data: { dogId: dog.id, accessoryId, equipped: true },
    });
    const updated = await prisma.dog.update({
      where: { id: dog.id },
      data: { foodCurrency: dog.foodCurrency - accessory.price },
      include: { breed: true },
    });
    return NextResponse.json(updated);
  }

  // Unlock a new breed
  if (action === "unlock_breed" && breedId) {
    const breed = await prisma.dogBreed.findUnique({
      where: { id: breedId },
    });
    if (!breed)
      return NextResponse.json({ error: "Breed not found" }, { status: 404 });
    if (dog.foodCurrency < breed.unlockCost)
      return NextResponse.json({ error: "Not enough food" }, { status: 400 });

    const updated = await prisma.dog.update({
      where: { id: dog.id },
      data: {
        breedId: breed.id,
        foodCurrency: dog.foodCurrency - breed.unlockCost,
      },
      include: { breed: true },
    });
    return NextResponse.json(updated);
  }

  // Equip an owned accessory
  if (action === "equip" && accessoryId) {
    await prisma.dogAccessory.updateMany({
      where: { dogId: dog.id, accessory: { type: await getAccessoryType(accessoryId) } },
      data: { equipped: false },
    });
    await prisma.dogAccessory.update({
      where: {
        dogId_accessoryId: { dogId: dog.id, accessoryId },
      },
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

async function getAccessoryType(accessoryId: string): Promise<AccessoryType> {
  const a = await prisma.accessory.findUnique({ where: { id: accessoryId } });
  return a!.type;
}
