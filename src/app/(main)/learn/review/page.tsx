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
      setWords([]); // Trigger done state
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, words.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center space-y-4">
          <p className="text-4xl">✅</p>
          <p className="text-xl font-bold text-gray-800">No reviews due</p>
          <p className="text-gray-400">Come back later!</p>
          <button onClick={() => router.push("/learn")} className="bg-green-500 text-white rounded-xl px-8 py-3 font-bold">
            Back
          </button>
        </div>
      </div>
    );
  }

  if (index >= words.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <div className="text-center space-y-4">
          <p className="text-4xl">🎉</p>
          <p className="text-xl font-bold text-gray-800">Review Complete!</p>
          <button onClick={() => router.push("/learn")} className="bg-green-500 text-white rounded-xl px-8 py-3 font-bold">
            Back to Learn
          </button>
        </div>
      </div>
    );
  }

  const current = words[index];

  return (
    <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <p className="text-center text-sm text-gray-400 mb-4">
          Review {index + 1} / {words.length}
        </p>
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
        />
      )}
    </div>
  );
}
