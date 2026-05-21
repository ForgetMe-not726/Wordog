import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const p = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });

  const dogs = await p.dog.findMany({ include: { user: { select: { email: true } } } });
  for (const d of dogs) {
    console.log(`${d.user.email}: ${d.name} -> ${d.foodCurrency} food`);
    await p.dog.update({ where: { id: d.id }, data: { foodCurrency: 500 } });
    console.log(`  updated to 500`);
  }

  await p.$disconnect();
}

main();
