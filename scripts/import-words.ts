import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

interface YoudaoWord {
  wordRank: number;
  headWord: string;
  content: {
    word: {
      wordHead: string;
      wordId: string;
      content: {
        sentence?: {
          sentences: { sContent: string; sCn?: string }[];
        };
        usphone?: string;
        ukphone?: string;
        phone?: string;
        syno?: {
          synos: {
            pos: string;
            tran: string;
            hwds: { w: string }[];
          }[];
        };
        relWord?: {
          rels: {
            pos: string;
            words: { hwd: string; tran: string }[];
          }[];
        };
        trans: { tranCn: string; pos: string }[];
      };
    };
  };
  bookId: string;
}

function parseJsonl(filePath: string): YoudaoWord[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  return raw
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
}

function extractWordData(w: YoudaoWord) {
  const c = w.content.word.content;

  const phonetic = c.usphone || c.ukphone || c.phone || null;

  const meaning = c.trans
    .map((t) => `${t.pos ? t.pos + ". " : ""}${t.tranCn}`)
    .join("；");

  const sentences = c.sentence?.sentences ?? [];
  const example =
    sentences.length > 0
      ? `${sentences[0].sContent}${sentences[0].sCn ? " " + sentences[0].sCn : ""}`
      : null;

  const synonyms =
    c.syno?.synos.flatMap((s) => s.hwds.map((h) => h.w)).slice(0, 5) ?? [];

  const antonyms: string[] = [];

  const confusables: string[] = [];

  const derivatives =
    c.relWord?.rels.flatMap((r) => r.words.map((w2) => w2.hwd)).slice(0, 6) ??
    [];

  return {
    word: w.headWord,
    phonetic: phonetic ? `/${phonetic}/` : null,
    meaning,
    example,
    synonyms: JSON.stringify(synonyms),
    antonyms: JSON.stringify(antonyms),
    confusables: JSON.stringify(confusables),
    derivatives: JSON.stringify(derivatives),
  };
}

async function importBook(
  filePath: string,
  bookName: string,
  description: string
) {
  console.log(`Importing ${bookName} from ${filePath}...`);

  const words = parseJsonl(filePath);
  console.log(`  Found ${words.length} words`);

  const book = await prisma.wordBook.upsert({
    where: { name: bookName },
    update: {},
    create: { name: bookName, description, wordCount: 0 },
  });

  let imported = 0;
  let skipped = 0;

  for (const w of words) {
    const data = extractWordData(w);

    try {
      await prisma.word.upsert({
        where: { word_wordBookId: { word: data.word, wordBookId: book.id } },
        update: {},
        create: { ...data, wordBookId: book.id },
      });
      imported++;
    } catch {
      skipped++;
    }

    if (imported % 200 === 0) {
      console.log(`  Progress: ${imported}/${words.length}`);
    }
  }

  await prisma.wordBook.update({
    where: { id: book.id },
    data: { wordCount: imported },
  });

  console.log(`  Done: ${imported} imported, ${skipped} skipped`);
  return imported;
}

async function main() {
  const dataDir = path.resolve(__dirname, "..", "data");

  const cet4Count = await importBook(
    path.join(dataDir, "CET4_1.json"),
    "CET-4",
    "大学英语四级核心词汇"
  );

  const cet6Count = await importBook(
    path.join(dataDir, "CET6_1.json"),
    "CET-6",
    "大学英语六级核心词汇"
  );

  console.log(`\nTotal: CET-4 ${cet4Count} words, CET-6 ${cet6Count} words`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
