"use client";

import { useEffect, useState } from "react";

interface WordBookProgress {
  id: string;
  name: string;
  description: string | null;
  totalWords: number;
  learnedWords: number;
  remainingWords: number;
  progress: number;
}

export default function WordBookList() {
  const [books, setBooks] = useState<WordBookProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wordbooks")
      .then((r) => r.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 shadow-sm animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-2 bg-gray-100 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-4">
        No word books available
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {books.map((book) => (
        <div
          key={book.id}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-gray-800">{book.name}</p>
              {book.description && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {book.description}
                </p>
              )}
            </div>
            <span className="text-lg font-bold text-orange-500">
              {book.progress}%
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${book.progress}%`,
                background:
                  book.progress >= 80
                    ? "#F97316"
                    : book.progress >= 40
                      ? "#f59e0b"
                      : "#6366f1",
              }}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>
              {book.learnedWords} / {book.totalWords} learned
            </span>
            <span>{book.remainingWords} remaining</span>
          </div>
        </div>
      ))}
    </div>
  );
}
