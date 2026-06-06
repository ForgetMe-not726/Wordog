import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: true },
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Seed dog breeds
  await prisma.dogBreed.upsert({
    where: { name: "Shiba" },
    update: {},
    create: { name: "Shiba", imageUrl: "/dogs/shiba.png", unlockCost: 0, isDefault: true },
  });
  await prisma.dogBreed.upsert({
    where: { name: "Corgi" },
    update: {},
    create: { name: "Corgi", imageUrl: "/dogs/corgi.png", unlockCost: 300, isDefault: false },
  });
  console.log("Breeds seeded");

  // Seed accessories
  const accessories = [
    { id: "scarf-red", name: "Red Scarf", type: "scarf" as const, imageUrl: "/accessories/red-scarf.png", price: 50 },
    { id: "hat-cowboy", name: "Cowboy Hat", type: "hat" as const, imageUrl: "/accessories/cowboy-hat.png", price: 80 },
    { id: "glasses-round", name: "Round Glasses", type: "glasses" as const, imageUrl: "/accessories/round-glasses.png", price: 60 },
  ];
  for (const a of accessories) {
    await prisma.accessory.upsert({ where: { id: a.id }, update: {}, create: a });
  }
  console.log("Accessories seeded");

  // Seed word books + words
  const fs = await import("fs");
  const path = await import("path");

  const books = [
    { file: "CET4_1.json", name: "CET-4", desc: "大学英语四级核心词汇" },
    { file: "CET6_1.json", name: "CET-6", desc: "大学英语六级核心词汇" },
  ];

  const dataDir = path.resolve("data");
  for (const { file, name, desc } of books) {
    const raw = fs.readFileSync(path.join(dataDir, file), "utf-8");
    const words = raw.trim().split("\n").map((l: string) => JSON.parse(l));

    const book = await prisma.wordBook.upsert({
      where: { name },
      update: {},
      create: { name, description: desc, wordCount: 0 },
    });

    let count = 0;
    for (const w of words) {
      const c = w.content.word.content;
      const phonetic = c.usphone || c.ukphone || c.phone || null;
      const meaning = (c.trans ?? []).map((t: any) => `${t.pos ? t.pos + ". " : ""}${t.tranCn}`).join("；");
      const sentences = c.sentence?.sentences ?? [];
      const example = sentences.length > 0 ? `${sentences[0].sContent}${sentences[0].sCn ? " " + sentences[0].sCn : ""}` : null;
      const synonyms = c.syno?.synos?.flatMap((s: any) => s.hwds.map((h: any) => h.w)).slice(0, 5) ?? [];
      const derivatives = c.relWord?.rels?.flatMap((r: any) => r.words.map((w2: any) => w2.hwd)).slice(0, 6) ?? [];

      try {
        await prisma.word.upsert({
          where: { word_wordBookId: { word: w.headWord, wordBookId: book.id } },
          update: {
            phonetic: phonetic ? `/${phonetic}/` : null,
            meaning,
            example,
            synonyms: JSON.stringify(synonyms),
            antonyms: JSON.stringify([]),
            confusables: JSON.stringify([]),
            derivatives: JSON.stringify(derivatives),
          },
          create: {
            word: w.headWord,
            phonetic: phonetic ? `/${phonetic}/` : null,
            meaning,
            example,
            synonyms: JSON.stringify(synonyms),
            antonyms: JSON.stringify([]),
            confusables: JSON.stringify([]),
            derivatives: JSON.stringify(derivatives),
            wordBookId: book.id,
          },
        });
        count++;
        if (count % 200 === 0) console.log(`  ${name}: ${count}/${words.length}`);
      } catch { /* skip duplicates */ }
    }

    await prisma.wordBook.update({ where: { id: book.id }, data: { wordCount: count } });
    console.log(`  ${name}: ${count} words imported`);
  }

  console.log("\nProduction seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
