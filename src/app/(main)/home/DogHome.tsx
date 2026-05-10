"use client";

import { useEffect, useState } from "react";
import DogDisplay from "@/components/dog/DogDisplay";
import DogStatusBars from "@/components/dog/DogStatusBars";
import Link from "next/link";

interface DogState {
  name: string;
  breed: { name: string; imageUrl: string };
  foodCurrency: number;
  fullness: number;
  mood: number;
  equippedAccessories: { id: string; name: string; type: string; imageUrl: string; price: number }[];
  streak: number;
}

export default function DogHome() {
  const [dog, setDog] = useState<DogState | null>(null);
  const [feeding, setFeeding] = useState(false);

  async function refreshDog() {
    const r = await fetch("/api/dog");
    if (r.ok) setDog(await r.json());
  }

  useEffect(() => {
    refreshDog();
  }, []);

  async function handleFeed() {
    setFeeding(true);
    await fetch("/api/dog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "feed" }),
    });
    await refreshDog();
    setFeeding(false);
  }

  if (!dog) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 via-green-100 to-green-50 p-4 flex flex-col items-center justify-center gap-6">
      <div className="absolute top-6 bg-white/60 rounded-full px-4 py-1 text-sm text-gray-500">
        ☀️ Sunny Day
      </div>

      <DogDisplay name={dog.name} mood={dog.mood} />

      <div className="w-full max-w-sm">
        <DogStatusBars
          foodCurrency={dog.foodCurrency}
          fullness={dog.fullness}
          mood={dog.mood}
          streak={dog.streak}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleFeed}
          disabled={feeding || dog.foodCurrency < 10}
          className="bg-orange-400 text-white rounded-xl px-6 py-3 font-bold shadow hover:bg-orange-500 transition-colors disabled:opacity-50"
        >
          🦴 Feed (10)
        </button>
        <Link
          href="/learn"
          className="bg-green-500 text-white rounded-xl px-6 py-3 font-bold shadow hover:bg-green-600 transition-colors"
        >
          📖 Go Learn
        </Link>
      </div>
    </div>
  );
}
