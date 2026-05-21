import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dog = await prisma.dog.findUnique({
    where: { userId: session.user.id },
    include: {
      accessories: { include: { accessory: true } },
    },
  });

  if (!dog) {
    return NextResponse.json({ error: "No dog found" }, { status: 404 });
  }

  const [accessories, breeds] = await Promise.all([
    prisma.accessory.findMany({ orderBy: { price: "asc" } }),
    prisma.dogBreed.findMany({ orderBy: { unlockCost: "asc" } }),
  ]);

  const ownedMap = new Map(
    dog.accessories.map((da) => [da.accessoryId, da.equipped]),
  );

  return NextResponse.json({
    foodCurrency: dog.foodCurrency,
    currentBreedId: dog.breedId,
    accessories: accessories.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      imageUrl: a.imageUrl,
      price: a.price,
      owned: ownedMap.has(a.id),
      equipped: ownedMap.get(a.id) ?? false,
    })),
    breeds: breeds.map((b) => ({
      id: b.id,
      name: b.name,
      imageUrl: b.imageUrl,
      unlockCost: b.unlockCost,
      isDefault: b.isDefault,
      unlocked: b.isDefault || b.id === dog.breedId,
      active: b.id === dog.breedId,
    })),
  });
}
