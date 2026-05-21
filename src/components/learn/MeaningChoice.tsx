"use client";

import PronounceButton from "@/components/ui/PronounceButton";
import { stripChinese } from "@/lib/text";

interface MeaningChoiceProps {
  word: string;
  phonetic: string | null;
  example: string | null;
  options: string[];
  onAnswer: (selected: string) => void;
}

export default function MeaningChoice({
  word,
  phonetic,
  example,
  options,
  onAnswer,
}: MeaningChoiceProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <p className="text-3xl font-bold text-gray-800">{word}</p>
        {phonetic && <p className="text-gray-400">{phonetic}</p>}
        <PronounceButton word={word} />
        {example && (
          <p className="text-gray-500 italic text-sm">{stripChinese(example)}</p>
        )}
      </div>

      <div className="grid gap-3 mt-4">
        {options.map((option, i) => (
          <button
            key={i}
            onClick={() => onAnswer(option)}
            className="bg-white border-2 border-gray-200 hover:border-green-400 rounded-xl px-4 py-3 text-left text-gray-700 transition-colors"
          >
            {String.fromCharCode(65 + i)}. {option}
          </button>
        ))}
      </div>
    </div>
  );
}
