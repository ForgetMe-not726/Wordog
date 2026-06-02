"use client";

import { useEffect, useState } from "react";

interface Book {
  id: string;
  name: string;
}

export default function WordBookSelector() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    fetch("/api/wordbooks")
      .then((r) => r.json())
      .then((data) => {
        setBooks([{ id: "", name: "全部词库" }, ...data]);
        const saved = localStorage.getItem("selectedBookId") || "";
        setSelectedId(saved);
      });
  }, []);

  function select(bookId: string) {
    setSelectedId(bookId);
    if (bookId) {
      localStorage.setItem("selectedBookId", bookId);
    } else {
      localStorage.removeItem("selectedBookId");
    }
  }

  if (books.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      {books.map((b) => (
        <button
          key={b.id}
          onClick={() => select(b.id)}
          className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${
            selectedId === b.id
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-white text-gray-500 border border-gray-200 hover:border-orange-300"
          }`}
        >
          {b.name}
        </button>
      ))}
    </div>
  );
}
