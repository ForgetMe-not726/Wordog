"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WordCard from "@/components/ui/WordCard";
import { parsePos } from "@/lib/text";

interface CustomBook {
  id: string;
  name: string;
  _count: { words: number };
}

interface CustomWord {
  id: string;
  word: string;
  phonetic: string | null;
  meaning: string;
  example: string | null;
}

export default function CustomWordBooksPage() {
  const [books, setBooks] = useState<CustomBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [words, setWords] = useState<CustomWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBookName, setNewBookName] = useState("");
  const [adding, setAdding] = useState(false);

  // WordCard state
  const [cardWord, setCardWord] = useState<{ word: string; phonetic: string | null; meaning: string; example: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/words/custom")
      .then((r) => r.json())
      .then((data) => { setBooks(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (selectedBook) {
      fetch(`/api/words/custom/${selectedBook}/words`)
        .then((r) => r.json())
        .then(setWords);
    }
  }, [selectedBook]);

  async function createBook() {
    if (!newBookName.trim()) return;
    setAdding(true);
    const r = await fetch("/api/words/custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBookName.trim() }),
    });
    if (r.ok) {
      const book = await r.json();
      setBooks((prev) => [book, ...prev]);
      setNewBookName("");
    }
    setAdding(false);
  }

  async function deleteBook(id: string) {
    if (!confirm("确定删除这个词库？")) return;
    await fetch(`/api/words/custom/${id}`, { method: "DELETE" });
    setBooks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBook === id) setSelectedBook(null);
  }

  async function deleteWord(wordId: string) {
    await fetch(`/api/words/custom/${selectedBook}/words?wordId=${wordId}`, { method: "DELETE" });
    setWords((prev) => prev.filter((w) => w.id !== wordId));
    if (selectedBook) {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === selectedBook ? { ...b, _count: { words: Math.max(0, b._count.words - 1) } } : b,
        ),
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-100 to-orange-50">
        <div className="w-8 h-8 border-3 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">自建词库</h1>
        <Link href="/learn" className="text-sm text-orange-500 font-bold">
          返回学习
        </Link>
      </div>

      {/* Create new book */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 space-y-2">
        <p className="text-sm font-bold text-gray-600">创建新词库</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newBookName}
            onChange={(e) => setNewBookName(e.target.value)}
            placeholder="词库名称..."
            className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-700 border border-gray-100 focus:border-orange-400 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && createBook()}
          />
          <button
            onClick={createBook}
            disabled={adding || !newBookName.trim()}
            className="bg-orange-500 text-white rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            创建
          </button>
        </div>
      </div>

      {/* Book list */}
      {books.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm space-y-2">
          <p className="text-4xl">📝</p>
          <p>还没有自建词库，创建一个吧</p>
        </div>
      ) : (
        <div className="space-y-2">
          {books.map((b) => (
            <div key={b.id}>
              <button
                onClick={() => setSelectedBook(selectedBook === b.id ? null : b.id)}
                className={`w-full bg-white rounded-2xl p-4 shadow-sm border text-left ${
                  selectedBook === b.id ? "border-orange-300" : "border-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700">{b.name}</p>
                    <p className="text-xs text-gray-400">{b._count.words} 个词</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      onClick={(e) => { e.stopPropagation(); deleteBook(b.id); }}
                      className="text-xs text-red-400 hover:text-red-500 font-bold px-2"
                    >
                      删除
                    </span>
                    <span className="text-gray-300 text-xs">
                      {selectedBook === b.id ? "收起 ▲" : "展开 ▼"}
                    </span>
                  </div>
                </div>
              </button>

              {/* Word list */}
              {selectedBook === b.id && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 mt-2">
                  {words.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      暂无单词，在学习中可通过单词卡添加到此处
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-72 overflow-y-auto">
                      {words.map((w) => {
                        const { pos, text } = parsePos(w.meaning);
                        return (
                          <div
                            key={w.id}
                            className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg text-sm"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-gray-700">{w.word}</span>
                              {pos && (
                                <span className="text-orange-500 text-[10px] ml-1.5">{pos}</span>
                              )}
                              <span className="text-gray-500 ml-1.5 text-xs truncate">{text}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setCardWord(w)}
                                className="text-xs bg-orange-50 text-orange-600 rounded-lg px-2 py-1 font-bold hover:bg-orange-100"
                              >
                                查看
                              </button>
                              <button
                                onClick={() => deleteWord(w.id)}
                                className="text-gray-300 hover:text-red-400"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {cardWord && (
        <WordCard
          word={cardWord.word}
          phonetic={cardWord.phonetic}
          meaning={cardWord.meaning}
          example={cardWord.example}
          synonyms={[]}
          antonyms={[]}
          confusables={[]}
          derivatives={[]}
          correct={true}
          onDismiss={() => setCardWord(null)}
        />
      )}
    </div>
  );
}
