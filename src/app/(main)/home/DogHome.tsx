"use client";

import { useEffect, useState } from "react";
import DogDisplay from "@/components/dog/DogDisplay";
import DogStatusBars from "@/components/dog/DogStatusBars";
import WeatherWidget from "@/components/weather/WeatherWidget";
import ShopDrawer from "@/components/shop/ShopDrawer";
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
  const [shopOpen, setShopOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-100 to-green-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-green-300 border-t-green-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">正在召唤你的小狗...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-green-50 to-amber-50/30 p-4 flex flex-col items-center justify-center relative overflow-hidden pb-20">
      {/* Decorative floating bones in background */}
      <span className="absolute top-20 right-8 text-3xl opacity-10 rotate-12 select-none pointer-events-none">🦴</span>
      <span className="absolute top-40 left-6 text-2xl opacity-8 -rotate-12 select-none pointer-events-none">🦴</span>
      <span className="absolute bottom-32 right-12 text-2xl opacity-6 rotate-45 select-none pointer-events-none">🐾</span>

      {/* Weather */}
      <div className="absolute top-4 left-4 z-10">
        <WeatherWidget />
      </div>

      {/* Dog area */}
      <div className="flex items-center justify-center w-full mt-10 mb-2">
        <div className="relative">
          <DogDisplay
            name={dog.name}
            mood={dog.mood}
            breed={dog.breed.name}
            accessories={dog.equippedAccessories}
          />
        </div>
      </div>

      {/* Actions below dog */}
      <div className="w-full max-w-sm space-y-2.5 pb-2">
        <div className="flex gap-2.5">
          <button
            onClick={handleFeed}
            disabled={feeding || dog.foodCurrency < 10}
            className="flex-1 bg-amber-50 text-amber-700 rounded-xl py-2.5 font-bold border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            🦴 喂食
          </button>
          <button
            onClick={() => setShopOpen(true)}
            className="flex-1 bg-purple-50 text-purple-600 rounded-xl py-2.5 font-bold border border-purple-200 hover:bg-purple-100 transition-colors text-sm"
          >
            🏪 商店
          </button>
        </div>

        <DogStatusBars
          foodCurrency={dog.foodCurrency}
          fullness={dog.fullness}
          mood={dog.mood}
          streak={dog.streak}
        />

        <Link
          href="/learn"
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl py-3 font-bold shadow-lg shadow-green-300/40 hover:shadow-xl hover:shadow-green-300/50 hover:scale-[1.02] transition-all duration-200 active:scale-95"
        >
          <span>📖</span>
          <span>去学习赚粮</span>
        </Link>
      </div>

      <ShopDrawer
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        onUpdate={refreshDog}
      />
    </div>
  );
}
