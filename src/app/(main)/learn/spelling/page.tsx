"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import PronounceButton from "@/components/ui/PronounceButton";
import WordCard from "@/components/ui/WordCard";

interface SpellingWord {
  id: string;
  word: string;
  phonetic: string | null;
  meaning: string;
  pos: string | null;
  meaningText: string | null;
  example: string | null;
  synonyms: string[];
  antonyms: string[];
  confusables: string[];
  derivatives: string[];
}

export default function SpellingPage() {
  const router = useRouter();
  const [words, setWords] = useState<SpellingWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [totalWords, setTotalWords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [required, setRequired] = useState(20);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [cardWord, setCardWord] = useState<SpellingWord | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/spelling")
      .then((r) => r.json())
      .then((data) => {
        if (data.unlocked) {
          setWords(data.words);
          setUnlocked(true);
        } else {
          setTotalWords(data.total);
          setRequired(data.required);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  const submitAnswer = useCallback(async (answer: string) => {
    if (!words[currentIndex]) return;

    const r = await fetch("/api/spelling", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId: words[currentIndex].id, answer }),
    });
    const data = await r.json();

    if (data.correct) {
      setCorrectCount((c) => c + 1);
      setFeedback("correct");
      /// Show the actual word briefly before advancing
      setCardWord({ ...words[currentIndex], word: data.actualWord });
      setTimeout(() => {
        setFeedback(null);
        setCardWord(null);
        if (currentIndex + 1 >= words.length) {
          setDone(true);
        } else {
          setCurrentIndex((i) => i + 1);
        }
        setInput("");
      }, 1200);
    } else {
      setFeedback("wrong");
      setCardWord({ ...words[currentIndex], word: data.actualWord });
    }
  }, [words, currentIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || feedback) return;
    submitAnswer(input.trim());
  };

  const handleDismissCard = () => {
    setCardWord(null);
    setFeedback(null);
    setInput("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-100 to-orange-50">
        <div className="w-8 h-8 border-3 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-100 to-orange-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 text-center space-y-4 max-w-sm">
          <p className="text-5xl">✍️</p>
          <p className="text-lg font-bold text-gray-800">拼写练习未解锁</p>
          <p className="text-gray-400 text-sm">
            需要积累 <span className="font-bold text-amber-500">{required}</span> 个已学单词
            <br />
            当前已学：<span className="font-bold text-gray-600">{totalWords}</span> 个
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-300 to-orange-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min((totalWords / required) * 100, 100)}%` }}
            />
          </div>
          <button
            onClick={() => router.push("/learn")}
            className="bg-orange-500 text-white rounded-xl px-8 py-3 font-bold"
          >
            去学习
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    const accuracy = words.length > 0 ? Math.round((correctCount / words.length) * 100) : 0;
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-100 to-orange-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-50 text-center space-y-4 max-w-sm w-full">
          <p className="text-5xl">{accuracy >= 80 ? "🎉" : accuracy >= 50 ? "💪" : "📚"}</p>
          <p className="text-xl font-bold text-gray-800">拼写完成</p>
          <div className="flex justify-center gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-orange-500">{correctCount}</p>
              <p className="text-xs text-gray-400">正确</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-400">{words.length - correctCount}</p>
              <p className="text-xs text-gray-400">错误</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-500">{accuracy}%</p>
              <p className="text-xs text-gray-400">正确率</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/learn")}
            className="bg-orange-500 text-white rounded-xl px-8 py-3 font-bold w-full"
          >
            返回学习
          </button>
        </div>
      </div>
    );
  }

  const current = words[currentIndex];
  if (!current) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-orange-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{currentIndex + 1} / {words.length}</span>
          <span>正确 {correctCount}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-300 to-orange-400 rounded-full transition-all duration-300"
            style={{ width: `${(currentIndex / words.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 text-center space-y-3">
          <p className="text-gray-500 text-sm">请拼写以下单词</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {current.pos && (
              <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {current.pos}
              </span>
            )}
            <span className="text-xl font-bold text-gray-800">
              {current.meaningText || current.meaning}
            </span>
          </div>
          <PronounceButton word={current.word} size="lg" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (feedback === "wrong") {
                  setFeedback(null);
                  setCardWord(null);
                }
              }}
              placeholder="输入英文拼写..."
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className={`w-full bg-white rounded-2xl px-5 py-4 text-lg text-gray-800 border-2 outline-none transition-colors text-center ${
                feedback === "correct"
                  ? "border-orange-400 bg-orange-50"
                  : feedback === "wrong"
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 focus:border-orange-400"
              }`}
            />
            {feedback && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">
                {feedback === "correct" ? "✅" : "❌"}
              </span>
            )}
          </div>

          {feedback === "wrong" && (
            <button
              type="submit"
              className="w-full bg-amber-50 text-amber-700 rounded-2xl py-3 font-bold border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              再看一次
            </button>
          )}
        </form>
      </div>

      {cardWord && feedback === "wrong" && (
        <WordCard
          word={cardWord.word}
          phonetic={cardWord.phonetic}
          meaning={cardWord.meaning}
          example={cardWord.example}
          synonyms={cardWord.synonyms}
          antonyms={cardWord.antonyms}
          confusables={cardWord.confusables}
          derivatives={cardWord.derivatives}
          correct={false}
          onDismiss={handleDismissCard}
          showAddToBook
          wordId={cardWord.id}
        />
      )}
    </div>
  );
}
