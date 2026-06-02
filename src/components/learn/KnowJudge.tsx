"use client";

import PronounceButton from "@/components/ui/PronounceButton";

interface KnowJudgeProps {
  word: string;
  onJudge: (know: boolean) => void;
}

export default function KnowJudge({ word, onJudge }: KnowJudgeProps) {
  return (
    <div className="text-center space-y-6">
      <p className="text-3xl font-bold text-gray-800">{word}</p>
      <PronounceButton word={word} size="lg" />
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => onJudge(false)}
          className="bg-red-100 text-red-600 rounded-xl px-8 py-4 font-bold text-lg hover:bg-red-200 transition-colors"
        >
          Don&apos;t Know
        </button>
        <button
          onClick={() => onJudge(true)}
          className="bg-orange-100 text-orange-600 rounded-xl px-8 py-4 font-bold text-lg hover:bg-orange-200 transition-colors"
        >
          Know
        </button>
      </div>
    </div>
  );
}
