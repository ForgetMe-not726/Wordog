"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import PronounceButton from "./PronounceButton";
import { parsePos } from "@/lib/text";

interface CustomBook {
  id: string;
  name: string;
}

interface WordCardProps {
  word: string;
  phonetic: string | null;
  meaning: string;
  example: string | null;
  synonyms: string[];
  antonyms: string[];
  confusables: string[];
  derivatives: string[];
  correct: boolean;
  showAddToBook?: boolean;
  wordId?: string;
  onDismiss: () => void;
}

export default function WordCard({
  word,
  phonetic,
  meaning,
  example,
  synonyms,
  antonyms,
  confusables,
  derivatives,
  correct,
  onDismiss,
  showAddToBook = false,
  wordId,
}: WordCardProps) {
  const [books, setBooks] = useState<CustomBook[]>([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState("");

  useEffect(() => {
    if (showAddToBook) {
      fetch("/api/words/custom")
        .then((r) => r.json())
        .then((d) => {
          setBooks(d);
          if (d.length > 0) setSelectedBook(d[0].id);
        });
    }
  }, [showAddToBook]);

  async function addToBook(wordId: string) {
    if (!selectedBook) return;
    setAdding(true);
    const r = await fetch("/api/words/add-to-book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId, bookId: selectedBook }),
    });
    const d = await r.json();
    setAdding(false);
    setAddedMsg(d.error ? (d.error === "Already in book" ? "已在词库中" : "添加失败") : "已添加");
    setTimeout(() => setAddedMsg(""), 2000);
  }
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-end justify-center z-[60]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      >
        <motion.div
          className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto p-6 pb-8 space-y-4 mb-16"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold ${
                correct ? "text-green-500" : "text-red-400"
              }`}
            >
              {correct ? "✓ Correct" : "✗ Review"}
            </span>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">{word}</p>
            {phonetic && <p className="text-gray-400 mt-1">{phonetic}</p>}
            <div className="mt-2">
              <PronounceButton word={word} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {parsePos(meaning).pos && (
              <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {parsePos(meaning).pos}
              </span>
            )}
            <p className="text-lg text-gray-700 font-medium">
              {parsePos(meaning).text}
            </p>
          </div>

          {example && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-500 mb-1">Example</p>
              <p className="text-gray-700">{example}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            {synonyms.length > 0 && (
              <div>
                <p className="text-gray-400">Synonyms</p>
                <p className="text-gray-700">{synonyms.join(", ")}</p>
              </div>
            )}
            {antonyms.length > 0 && (
              <div>
                <p className="text-gray-400">Antonyms</p>
                <p className="text-gray-700">{antonyms.join(", ")}</p>
              </div>
            )}
            {confusables.length > 0 && (
              <div className="col-span-2">
                <p className="text-gray-400">Easily Confused</p>
                <p className="text-gray-700">{confusables.join(" / ")}</p>
              </div>
            )}
            {derivatives.length > 0 && (
              <div className="col-span-2">
                <p className="text-gray-400">Derivatives</p>
                <p className="text-gray-700">{derivatives.join(", ")}</p>
              </div>
            )}
          </div>

          {showAddToBook && wordId && books.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">添加到词库</p>
              <div className="flex gap-2">
                <select
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-700 border border-gray-100"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => addToBook(wordId)}
                  disabled={adding}
                  className="bg-amber-100 text-amber-700 rounded-xl px-4 py-2 text-sm font-bold hover:bg-amber-200 transition-colors shrink-0"
                >
                  {addedMsg || "添加"}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={onDismiss}
            className="w-full bg-green-500 text-white rounded-xl py-3 font-bold text-lg hover:bg-green-600 transition-colors"
          >
            知道了
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
