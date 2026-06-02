"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import MeaningChoice from "@/components/learn/MeaningChoice";
import KnowJudge from "@/components/learn/KnowJudge";
import WordCard from "@/components/ui/WordCard";

interface WordData {
  id: string;
  word: string;
  phonetic: string | null;
  meaning: string;
  example: string | null;
  synonyms: string[];
  antonyms: string[];
  confusables: string[];
  derivatives: string[];
  options: string[];
}

type Round = "meaning" | "know1" | "know2";

interface QueueItem {
  word: WordData;
  round: Round;
}

const SPACING = {
  meaning: 5,
  know1: 8,
  know2: 0,
} as const;

const WRONG_SPACING = 5;

export default function NewWordPage() {
  const router = useRouter();
  const [session, setSession] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [cardWord, setCardWord] = useState<WordData | null>(null);
  const [cardCorrect, setCardCorrect] = useState(true);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const bookId = localStorage.getItem("selectedBookId") || null;
    fetch("/api/learn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookId ? { wordBookId: bookId } : {}),
    })
      .then((r) => r.json())
      .then((words: WordData[]) => {
        setSession(words.map((w) => ({ word: w, round: "meaning" as Round })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const recordAnswer = useCallback(
    async (wordId: string, round: number, correct: boolean) => {
      await fetch("/api/learn", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId, round, correct }),
      });
    },
    [],
  );

  const insertIntoQueue = useCallback(
    (queue: QueueItem[], item: QueueItem, offset: number) => {
      const insertAt = Math.min(currentIndex + offset, queue.length);
      queue.splice(insertAt, 0, item);
    },
    [currentIndex],
  );

  const handleMeaningAnswer = useCallback(
    async (selected: string) => {
      const item = session[currentIndex];
      if (!item) return;
      const correct = selected === item.word.meaning;
      setCardWord(item.word);
      setCardCorrect(correct);
      setShowCard(true);
      await recordAnswer(item.word.id, 1, correct);
    },
    [session, currentIndex, recordAnswer],
  );

  const handleKnowJudge = useCallback(
    async (know: boolean) => {
      const item = session[currentIndex];
      if (!item) return;
      const roundNum = item.round === "know1" ? 2 : 3;
      setCardWord(item.word);
      setCardCorrect(know);
      setShowCard(true);
      await recordAnswer(item.word.id, roundNum, know);
    },
    [session, currentIndex, recordAnswer],
  );

  const handleCardDismiss = useCallback(() => {
    setShowCard(false);
    setCardWord(null);

    const item = session[currentIndex];
    if (!item) return;

    const newSession = [...session];

    // Remove current item from position
    newSession.splice(currentIndex, 1);

    if (cardCorrect) {
      if (item.round === "meaning") {
        // Round 1 correct → schedule know1 after spacing
        insertIntoQueue(newSession, { ...item, round: "know1" }, SPACING.meaning);
      } else if (item.round === "know1") {
        // Round 2 correct → schedule know2 after spacing
        insertIntoQueue(newSession, { ...item, round: "know2" }, SPACING.know1);
      } else {
        // Round 3 correct → word learned, remove from queue
        setCompletedCount((c) => c + 1);
      }
    } else {
      // Wrong at any round → back to meaning, re-insert with spacing
      insertIntoQueue(newSession, { ...item, round: "meaning" }, WRONG_SPACING);
    }

    setSession(newSession);

    if (newSession.length === 0) {
      setDone(true);
      setCurrentIndex(0);
    } else {
      // Current index stays the same (next word slides into position)
      setCurrentIndex(Math.min(currentIndex, newSession.length - 1));
    }
  }, [session, currentIndex, cardCorrect, insertIntoQueue]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
        <div className="text-center space-y-4">
          <p className="text-4xl">🎉</p>
          <p className="text-xl font-bold text-gray-800">
            Session Complete!
          </p>
          <p className="text-gray-400">
            {completedCount} words learned. Great job!
          </p>
          <button
            onClick={() => router.push("/learn")}
            className="bg-orange-500 text-white rounded-xl px-8 py-3 font-bold"
          >
            Back to Learn
          </button>
        </div>
      </div>
    );
  }

  if (session.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
        <div className="text-center space-y-4">
          <p className="text-4xl">📚</p>
          <p className="text-xl font-bold text-gray-800">
            No new words available
          </p>
          <p className="text-gray-400">
            Add more words to your word book to continue
          </p>
          <button
            onClick={() => router.push("/learn")}
            className="bg-orange-500 text-white rounded-xl px-8 py-3 font-bold"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const current = session[currentIndex];
  if (!current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const roundLabel =
    current.round === "meaning"
      ? "Choose Meaning"
      : current.round === "know1"
        ? "Recall (1st)"
        : "Recall (2nd)";

  return (
    <div className="min-h-screen bg-orange-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            {completedCount} learned
          </p>
          <p className="text-sm text-gray-400">
            {currentIndex + 1} / {session.length} · {roundLabel}
          </p>
        </div>

        {current.round === "meaning" ? (
          <MeaningChoice
            word={current.word.word}
            phonetic={current.word.phonetic}
            example={current.word.example}
            options={current.word.options}
            onAnswer={handleMeaningAnswer}
          />
        ) : (
          <KnowJudge
            word={current.word.word}
            onJudge={handleKnowJudge}
          />
        )}
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
          onDismiss={handleCardDismiss}
          showAddToBook
          wordId={cardWord.id}
        />
      )}
    </div>
  );
}
