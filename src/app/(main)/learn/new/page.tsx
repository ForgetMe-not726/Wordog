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

export default function NewWordPage() {
  const router = useRouter();
  const [session, setSession] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [cardWord, setCardWord] = useState<WordData | null>(null);
  const [cardCorrect, setCardCorrect] = useState(true);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/learn", { method: "POST" })
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

  const handleMeaningAnswer = useCallback(
    (selected: string) => {
      const item = session[currentIndex];
      if (!item) return;
      const correct = selected === item.word.meaning;
      setCardWord(item.word);
      setCardCorrect(correct);
      setShowCard(true);
      recordAnswer(item.word.id, 1, correct);
    },
    [session, currentIndex, recordAnswer],
  );

  const handleKnowJudge = useCallback(
    (know: boolean) => {
      const item = session[currentIndex];
      if (!item) return;
      const roundNum = item.round === "know1" ? 2 : 3;
      setCardWord(item.word);
      setCardCorrect(know);
      setShowCard(true);
      recordAnswer(item.word.id, roundNum, know);
    },
    [session, currentIndex, recordAnswer],
  );

  const handleCardDismiss = useCallback(() => {
    setShowCard(false);
    setCardWord(null);

    const item = session[currentIndex];
    if (!item) return;

    const newSession = [...session];

    if (item.round === "meaning") {
      if (cardCorrect) {
        newSession[currentIndex] = { ...item, round: "know1" };
      } else {
        newSession.splice(currentIndex, 1);
        const insertAt = Math.min(currentIndex + 5, newSession.length);
        newSession.splice(insertAt, 0, item);
      }
    } else if (item.round === "know1") {
      if (cardCorrect) {
        newSession[currentIndex] = { ...item, round: "know2" };
      } else {
        newSession[currentIndex] = { ...item, round: "meaning" };
      }
    } else if (item.round === "know2") {
      if (cardCorrect) {
        newSession.splice(currentIndex, 1);
      } else {
        newSession[currentIndex] = { ...item, round: "meaning" };
      }
    }

    setSession(newSession);

    if (newSession.length === 0) {
      if (cardCorrect && item.round === "know2") {
        setDone(true);
      }
      setCurrentIndex(0);
    } else if (cardCorrect && item.round === "meaning") {
      // Stay at same index (item was updated in place to know1)
    } else if (cardCorrect && item.round === "know1") {
      // Stay at same index (item was updated in place to know2)
    } else if (cardCorrect && item.round === "know2") {
      // Item removed, next word slides into current position, stay
    } else {
      // Wrong answer: advance to next word
      setCurrentIndex(Math.min(currentIndex + 1, newSession.length - 1));
    }
  }, [session, currentIndex, cardCorrect]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <div className="text-center space-y-4">
          <p className="text-4xl">{"🎉"}</p>
          <p className="text-xl font-bold text-gray-800">
            Session Complete!
          </p>
          <p className="text-gray-400">Great job! All words learned.</p>
          <button
            onClick={() => router.push("/learn")}
            className="bg-green-500 text-white rounded-xl px-8 py-3 font-bold"
          >
            Back to Learn
          </button>
        </div>
      </div>
    );
  }

  if (session.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <div className="text-center space-y-4">
          <p className="text-4xl">{"📚"}</p>
          <p className="text-xl font-bold text-gray-800">
            No new words available
          </p>
          <p className="text-gray-400">
            Add more words to your word book to continue
          </p>
          <button
            onClick={() => router.push("/learn")}
            className="bg-green-500 text-white rounded-xl px-8 py-3 font-bold"
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
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <p className="text-center text-sm text-gray-400 mb-4">
          {currentIndex + 1} / {session.length}
          {current.round === "meaning"
            ? " · Choose Meaning"
            : current.round === "know1"
              ? " · Do You Know? (1/2)"
              : " · Do You Know? (2/2)"}
        </p>

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
        />
      )}
    </div>
  );
}
