// Strip Chinese characters and punctuation from a string
export function stripChinese(text: string): string {
  return text
    .replace(/[一-鿿]+/g, "")
    .replace(/[，。！？；：、""''【】（）《》…—\s]+$/g, "")
    .trim();
}

// Parse part of speech from meaning string like "vt. 放弃；抛弃" -> { pos: "vt.", text: "放弃；抛弃" }
export function parsePos(raw: string): { pos: string | null; text: string } {
  const m = raw.match(/^([a-z]+\.)\s*(.+)/i);
  if (m) return { pos: m[1], text: m[2] };
  return { pos: null, text: raw };
}
