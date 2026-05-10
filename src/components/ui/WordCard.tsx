"use client";

import { motion, AnimatePresence } from "framer-motion";

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
}: WordCardProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      >
        <motion.div
          className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto p-6 space-y-4"
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
            <button
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance(word);
                utterance.lang = "en-US";
                speechSynthesis.speak(utterance);
              }}
              className="mt-2 text-2xl"
              aria-label="Pronounce"
            >
              🔊
            </button>
          </div>

          <p className="text-lg text-center text-gray-700 font-medium">
            {meaning}
          </p>

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

          <button
            onClick={onDismiss}
            className="w-full bg-green-500 text-white rounded-xl py-3 font-bold text-lg hover:bg-green-600 transition-colors"
          >
            Got it
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
