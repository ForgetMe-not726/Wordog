"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import WordCard from "@/components/ui/WordCard";

interface WordResult {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  confusables: string[];
  derivatives: string[];
}

export default function LookupPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WordResult | null>(null);
  const [error, setError] = useState("");
  const [cardVisible, setCardVisible] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetch(`/api/lookup/suggest?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data) => {
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        })
        .catch(() => setSuggestions([]));
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const doLookup = useCallback(async (word: string) => {
    if (!word.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setCardVisible(false);
    setShowSuggestions(false);

    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(word.trim())}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        setCardVisible(true);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLookup(query);
  };

  const handleSuggestionClick = (word: string) => {
    setQuery(word);
    setShowSuggestions(false);
    doLookup(word);
  };

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">查词典</h1>

      <form onSubmit={handleSubmit} className="relative z-20">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="输入英文单词..."
              className="w-full bg-white rounded-xl px-4 py-3 text-gray-800 border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-30 overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-orange-500 text-white rounded-xl px-5 py-3 font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "搜索"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 bg-red-50 text-red-500 rounded-xl p-4 text-center text-sm">
          {error === "DeepSeek API call failed"
            ? "API 调用失败，请重试"
            : error === "Failed to parse word data"
              ? "未找到该单词"
              : error}
        </div>
      )}

      {loading && (
        <div className="mt-8 text-center">
          <div className="inline-block w-8 h-8 border-3 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-400 mt-2 text-sm">查询中...</p>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="mt-16 text-center space-y-3">
          <p className="text-5xl">🔍</p>
          <p className="text-gray-400">输入任意英文单词即可查询</p>
          <p className="text-gray-300 text-sm">由 DeepSeek AI 提供支持</p>
        </div>
      )}

      {cardVisible && result && (
        <WordCard
          word={result.word}
          phonetic={result.phonetic}
          meaning={result.meaning}
          example={result.example}
          synonyms={result.synonyms}
          antonyms={result.antonyms}
          confusables={result.confusables}
          derivatives={result.derivatives}
          correct={true}
          onDismiss={() => setCardVisible(false)}
        />
      )}

      {showSuggestions && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}
