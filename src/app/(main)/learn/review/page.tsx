"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import KnowJudge from "@/components/learn/KnowJudge";
import WordCard from "@/components/ui/WordCard";

interface ReviewWord {
  id: string;
  word: string;
  phonetic: string | null;
  meaning: string;
  example: string | null;
  synonyms: string[];
  antonyms: string[];
  confusables: string[];
  derivatives: string[];
}

export default function ReviewPage() {
  const router = useRouter();
  const [words, setWords] = useState<ReviewWord[]>([]);
  const [index, setIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [cardWord, setCardWord] = useState<ReviewWord | null>(null);
  const [cardCorrect, setCardCorrect] = useState(true);
  const [loading, setLoading] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    fetch("/api/review")
      .then((r) => r.json())
      .then((data) => {
        setWords(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleJudge = useCallback(
    async (know: boolean) => {
      const w = words[index];
      if (!w) return;
      setCardWord(w);
      setCardCorrect(know);
      setShowCard(true);
      if (know) setCorrectCount((c) => c + 1);

      await fetch("/api/review", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: w.id, correct: know }),
      });
    },
    [words, index],
  );

  const handleDismiss = useCallback(() => {
    setShowCard(false);
    setCardWord(null);
    if (index + 1 >= words.length) {
      setWords([]);
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, words.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="w-8 h-8 border-3 border-amber-300 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (words.length === 0 && !loading) {
    if (index === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 p-4">
          <div className="text-center space-y-4 bg-white rounded-2xl p-8 shadow-sm max-w-sm w-full">
            <p className="text-4xl">✅</p>
            <p className="text-lg font-bold text-gray-800">暂无待复习</p>
            <p className="text-gray-400 text-sm">还没有到复习时间的单词</p>
            <button onClick={() => router.push("/learn")} className="bg-orange-500 text-white rounded-xl px-8 py-3 font-bold w-full">
              返回学习
            </button>
          </div>
        </div>
      );
    }
    // Just completed
    const total = correctCount + (words.length || index);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50 p-4">
        <div className="text-center space-y-4 bg-white rounded-2xl p-8 shadow-sm max-w-sm w-full">
          <p className="text-4xl">🎉</p>
          <p className="text-lg font-bold text-gray-800">复习完成</p>
          <div className="flex justify-center gap-6">
            <div>
              <p className="text-2xl font-bold text-orange-500">{correctCount}</p>
              <p className="text-xs text-gray-400">认识</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{index - correctCount}</p>
              <p className="text-xs text-gray-400">不认识</p>
            </div>
          </div>
          <button onClick={() => router.push("/learn")} className="bg-orange-500 text-white rounded-xl px-8 py-3 font-bold w-full">
            返回学习
          </button>
        </div>
      </div>
    );
  }

  const current = words[index];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>复习</span>
          <span>{index + 1} / {words.length}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-300 to-orange-400 rounded-full transition-all duration-300"
            style={{ width: `${(index / words.length) * 100}%` }}
          />
        </div>

        {current && <KnowJudge word={current.word} onJudge={handleJudge} />}
      </div>

      {showCard && cardWord && (
        <WordCard
          word={cardWord.word}
          phonetic={cardWord.phonetic}
          meaning={cardWord.meaning}
          example={cardWord.example}
          synonyms={cardWord.synonyms}
          antonyms={cardWord.antonyms}
          confusables={cardWord.confusables}
          derivatives={cardWord.derivatives}
          correct={cardCorrect}
          onDismiss={handleDismiss}
          showAddToBook
          wordId={cardWord.id}
        />
      )}
    </div>
  );
}
