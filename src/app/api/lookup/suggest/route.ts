import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase();

  if (!q || q.length < 1) {
    return NextResponse.json([]);
  }

  // Prefix match first
  const prefixMatches = await prisma.word.findMany({
    where: {
      word: { startsWith: q, mode: "insensitive" },
    },
    select: { word: true },
    take: 5,
    orderBy: { word: "asc" },
  });

  if (prefixMatches.length >= 5) {
    return NextResponse.json(prefixMatches.map((w) => w.word));
  }

  const seen = new Set(prefixMatches.map((w) => w.word));
  const results = prefixMatches.map((w) => w.word);

  if (results.length < 5) {
    const containsMatches = await prisma.word.findMany({
      where: {
        word: { contains: q, mode: "insensitive" },
        ...(seen.size > 0 ? { NOT: { word: { in: Array.from(seen) } } } : {}),
      },
      select: { word: true },
      take: 5 - results.length,
      orderBy: { word: "asc" },
    });

    for (const w of containsMatches) {
      if (!seen.has(w.word)) {
        seen.add(w.word);
        results.push(w.word);
      }
    }
  }

  if (results.length < 5) {
    const remaining = 5 - results.length;
    try {
      const fuzzy = await prisma.$queryRaw<Array<{ word: string }>>`
        SELECT DISTINCT word FROM "Word"
        WHERE word NOT IN (${Array.from(seen).length > 0 ? Array.from(seen) : [""]})
          AND similarity(word, ${q}) > 0.15
        ORDER BY similarity(word, ${q}) DESC
        LIMIT ${remaining}
      `;
      for (const r of fuzzy) {
        if (!seen.has(r.word)) {
          seen.add(r.word);
          results.push(r.word);
        }
      }
    } catch {
      // pg_trgm not available
    }
  }

  return NextResponse.json(results);
}
