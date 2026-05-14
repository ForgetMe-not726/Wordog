"use client";

import { useState, useRef } from "react";

interface PronounceButtonProps {
  word: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

export default function PronounceButton({
  word,
  size = "md",
}: PronounceButtonProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const pronounce = async () => {
    if (playing) return;
    setPlaying(true);

    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      );
      const data = await res.json();

      let audioUrl: string | null = null;
      if (Array.isArray(data)) {
        for (const entry of data) {
          for (const p of entry.phonetics ?? []) {
            if (p.audio) {
              audioUrl = p.audio;
              break;
            }
          }
          if (audioUrl) break;
        }
      }

      if (!audioUrl) {
        setPlaying(false);
        return;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.onerror = () => setPlaying(false);
      await audio.play();
    } catch {
      setPlaying(false);
    }
  };

  return (
    <button
      onClick={pronounce}
      className={`${SIZE_CLASSES[size]} transition-opacity ${
        playing ? "opacity-50" : "opacity-100 hover:opacity-70"
      }`}
      aria-label={`Pronounce ${word}`}
      title={playing ? "Playing..." : `Pronounce ${word}`}
    >
      {playing ? "🔊" : "🔊"}
    </button>
  );
}
