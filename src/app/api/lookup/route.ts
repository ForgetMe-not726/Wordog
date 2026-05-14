import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

interface LookupResult {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  confusables: string[];
  derivatives: string[];
}

const SYSTEM_PROMPT = `你是一个英汉词典API。给定一个英文单词，返回JSON对象，严格包含以下字段：
- word: 输入的单词
- phonetic: 国际音标 (如 "/əˈbændən/")
- meaning: 中文释义，带词性 (如 "vt. 放弃；抛弃")
- example: 一句英文例句
- synonyms: 最多5个同义词数组
- antonyms: 最多5个反义词数组
- confusables: 最多3个易混淆词数组 (形近或音近的词)
- derivatives: 最多5个派生词数组

只返回合法JSON，不要markdown代码块，不要任何解释。`;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const word = searchParams.get("q")?.trim();

  if (!word) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: "DeepSeek API not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: word },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepSeek API error:", response.status, errText);
      return NextResponse.json(
        { error: "DeepSeek API call failed" },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse word data" },
        { status: 502 },
      );
    }

    const result: LookupResult = JSON.parse(jsonMatch[0]);

    // Ensure arrays
    result.synonyms = Array.isArray(result.synonyms) ? result.synonyms : [];
    result.antonyms = Array.isArray(result.antonyms) ? result.antonyms : [];
    result.confusables = Array.isArray(result.confusables) ? result.confusables : [];
    result.derivatives = Array.isArray(result.derivatives) ? result.derivatives : [];

    return NextResponse.json(result);
  } catch (e) {
    console.error("Lookup error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
