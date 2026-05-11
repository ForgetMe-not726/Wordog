import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

async function main() {
  // Create default dog breeds
  await prisma.dogBreed.upsert({
    where: { name: "Shiba" },
    update: {},
    create: {
      name: "Shiba",
      imageUrl: "/dogs/shiba.png",
      unlockCost: 0,
      isDefault: true,
    },
  });

  await prisma.dogBreed.upsert({
    where: { name: "Corgi" },
    update: {},
    create: {
      name: "Corgi",
      imageUrl: "/dogs/corgi.png",
      unlockCost: 300,
      isDefault: false,
    },
  });

  // Create accessories
  await prisma.accessory.upsert({
    where: { id: "scarf-red" },
    update: {},
    create: {
      id: "scarf-red",
      name: "Red Scarf",
      type: "scarf",
      imageUrl: "/accessories/red-scarf.png",
      price: 50,
    },
  });

  await prisma.accessory.upsert({
    where: { id: "hat-cowboy" },
    update: {},
    create: {
      id: "hat-cowboy",
      name: "Cowboy Hat",
      type: "hat",
      imageUrl: "/accessories/cowboy-hat.png",
      price: 80,
    },
  });

  await prisma.accessory.upsert({
    where: { id: "glasses-round" },
    update: {},
    create: {
      id: "glasses-round",
      name: "Round Glasses",
      type: "glasses",
      imageUrl: "/accessories/round-glasses.png",
      price: 60,
    },
  });

  // Create CET-4 word book
  const book = await prisma.wordBook.upsert({
    where: { name: "CET-4" },
    update: {},
    create: {
      name: "CET-4",
      description: "College English Test Band 4",
      wordCount: 0,
    },
  });

  // Insert sample words
  const sampleWords = [
    {
      word: "abandon",
      phonetic: "/əˈbændən/",
      meaning: "放弃；抛弃",
      example: "He abandoned his plan to travel.",
      synonyms: '["give up","desert","quit"]',
      antonyms: '["keep","continue","maintain"]',
      confusables: '["abundant","abandonment"]',
      derivatives: '["abandoned","abandonment"]',
    },
    {
      word: "ability",
      phonetic: "/əˈbɪləti/",
      meaning: "能力；才能",
      example: "She has the ability to succeed.",
      synonyms: '["capability","capacity","talent"]',
      antonyms: '["inability","incapacity"]',
      confusables: '["capability"]',
      derivatives: '["able","ably","disable"]',
    },
    {
      word: "absence",
      phonetic: "/ˈæbsəns/",
      meaning: "缺席；不在",
      example: "His absence was noticed by everyone.",
      synonyms: '["lack","nonexistence","shortage"]',
      antonyms: '["presence","attendance"]',
      confusables: '["absent","presence"]',
      derivatives: '["absent","absentee"]',
    },
    {
      word: "absolute",
      phonetic: "/ˈæbsəluːt/",
      meaning: "绝对的；完全的",
      example: "That's absolute nonsense.",
      synonyms: '["complete","total","utter"]',
      antonyms: '["relative","partial"]',
      confusables: '["absolutely","obsolete"]',
      derivatives: '["absolutely","absolution"]',
    },
    {
      word: "absorb",
      phonetic: "/əbˈzɔːb/",
      meaning: "吸收；吸引",
      example: "Plants absorb water from soil.",
      synonyms: '["soak up","take in","assimilate"]',
      antonyms: '["release","emit","exude"]',
      confusables: '["absorption","absorbent"]',
      derivatives: '["absorption","absorbed","absorbing"]',
    },
    {
      word: "abstract",
      phonetic: "/ˈæbstrækt/",
      meaning: "抽象的；摘要",
      example: "Abstract art can be hard to understand.",
      synonyms: '["theoretical","conceptual"]',
      antonyms: '["concrete","actual","tangible"]',
      confusables: '["extract","distract","contract"]',
      derivatives: '["abstraction","abstractly"]',
    },
    {
      word: "abundant",
      phonetic: "/əˈbʌndənt/",
      meaning: "丰富的；充裕的",
      example: "The region has abundant natural resources.",
      synonyms: '["plentiful","ample","rich"]',
      antonyms: '["scarce","rare","sparse"]',
      confusables: '["abandon","redundant"]',
      derivatives: '["abundance","abundantly"]',
    },
    {
      word: "abuse",
      phonetic: "/əˈbjuːz/",
      meaning: "滥用；虐待",
      example: "He abused his power as manager.",
      synonyms: '["misuse","mistreat","exploit"]',
      antonyms: '["respect","praise","cherish"]',
      confusables: '["amuse","accuse","abusive"]',
      derivatives: '["abusive","abusively"]',
    },
    {
      word: "academic",
      phonetic: "/ˌækəˈdemɪk/",
      meaning: "学术的；学院的",
      example: "She has a strong academic background.",
      synonyms: '["scholarly","educational","theoretical"]',
      antonyms: '["practical","vocational"]',
      confusables: '["academy","epidemic"]',
      derivatives: '["academy","academically","academia"]',
    },
    {
      word: "accelerate",
      phonetic: "/əkˈseləreɪt/",
      meaning: "加速；加快",
      example: "The car accelerates from 0 to 60 in 5 seconds.",
      synonyms: '["speed up","hasten","quicken"]',
      antonyms: '["decelerate","slow down","brake"]',
      confusables: '["accumulate","accentuate"]',
      derivatives: '["acceleration","accelerator","accelerating"]',
    },
    {
      word: "accent",
      phonetic: "/ˈæksent/",
      meaning: "口音；重音",
      example: "She speaks English with a British accent.",
      synonyms: '["pronunciation","tone","intonation"]',
      antonyms: "[]",
      confusables: '["ascent","assent","accident"]',
      derivatives: '["accentuate","accented"]',
    },
    {
      word: "access",
      phonetic: "/ˈækses/",
      meaning: "进入；访问；使用权",
      example: "You need a password to access the system.",
      synonyms: '["entry","admission","approach"]',
      antonyms: '["exit","barrier","exclusion"]',
      confusables: '["assess","excess","success"]',
      derivatives: '["accessible","accessibility","inaccessible"]',
    },
    {
      word: "accompany",
      phonetic: "/əˈkʌmpəni/",
      meaning: "陪伴；伴随",
      example: "She accompanied me to the station.",
      synonyms: '["escort","go with","attend"]',
      antonyms: '["abandon","leave"]',
      confusables: '["company","accomplice"]',
      derivatives: '["accompaniment","accompanying"]',
    },
    {
      word: "accomplish",
      phonetic: "/əˈkʌmplɪʃ/",
      meaning: "完成；实现",
      example: "He accomplished his goal of running a marathon.",
      synonyms: '["achieve","complete","fulfill"]',
      antonyms: '["fail","abandon","neglect"]',
      confusables: '["accompany","complish"]',
      derivatives: '["accomplishment","accomplished"]',
    },
    {
      word: "account",
      phonetic: "/əˈkaʊnt/",
      meaning: "账户；解释；说明",
      example: "I opened a new bank account.",
      synonyms: '["report","description","ledger"]',
      antonyms: "[]",
      confusables: '["count","accountant","discount"]',
      derivatives: '["accountant","accounting","accountable"]',
    },
  ];

  for (const w of sampleWords) {
    await prisma.word.create({
      data: { ...w, wordBookId: book.id },
    });
  }

  await prisma.wordBook.update({
    where: { id: book.id },
    data: { wordCount: sampleWords.length },
  });

  console.log(
    `Seeded: 2 dog breeds, 3 accessories, ${sampleWords.length} words in CET-4`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
