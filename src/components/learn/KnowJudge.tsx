"use client";

interface KnowJudgeProps {
  word: string;
  onJudge: (know: boolean) => void;
}

export default function KnowJudge({ word, onJudge }: KnowJudgeProps) {
  return (
    <div className="text-center space-y-6">
      <p className="text-3xl font-bold text-gray-800">{word}</p>
      <button
        onClick={() => {
          const utterance = new SpeechSynthesisUtterance(word);
          utterance.lang = "en-US";
          speechSynthesis.speak(utterance);
        }}
        className="text-4xl"
        aria-label="Pronounce"
      >
        {"🔊"}
      </button>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => onJudge(false)}
          className="bg-red-100 text-red-600 rounded-xl px-8 py-4 font-bold text-lg hover:bg-red-200 transition-colors"
        >
          Don&apos;t Know
        </button>
        <button
          onClick={() => onJudge(true)}
          className="bg-green-100 text-green-600 rounded-xl px-8 py-4 font-bold text-lg hover:bg-green-200 transition-colors"
        >
          Know
        </button>
      </div>
    </div>
  );
}
