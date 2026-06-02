"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface PronounceButtonProps {
  word: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

function directUrl(word: string) {
  return `https://api.dictionaryapi.dev/media/pronunciations/en/${encodeURIComponent(word.toLowerCase())}-us.mp3`;
}

async function fetchAudioUrl(word: string): Promise<string | null> {
  // Try API search for any available audio
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    );
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const entry of data) {
        for (const p of entry.phonetics ?? []) {
          if (p.audio) return p.audio;
        }
      }
    }
  } catch {}
  return null;
}

export default function PronounceButton({
  word,
  size = "md",
}: PronounceButtonProps) {
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);
  const audioUrl = useRef<string | null>(null);

  const preload = useCallback(async () => {
    setLoaded(false);
    setHasAudio(true);

    const audio = new Audio();
    audio.preload = "auto";

    // Try direct URL first — fast path
    audio.src = directUrl(word);

    const directOk = await new Promise<boolean>((resolve) => {
      audio.oncanplaythrough = () => resolve(true);
      audio.onerror = () => resolve(false);
      audio.load();
    });

    if (directOk) {
      audioUrl.current = directUrl(word);
      setLoaded(true);
      return;
    }

    // Direct failed — search API for alternatives
    const found = await fetchAudioUrl(word);
    if (found) {
      audio.src = found;
      const apiOk = await new Promise<boolean>((resolve) => {
        audio.oncanplaythrough = () => resolve(true);
        audio.onerror = () => resolve(false);
        audio.load();
      });
      if (apiOk) {
        audioUrl.current = found;
        setLoaded(true);
        return;
      }
    }

    setHasAudio(false);
    setLoaded(true);
  }, [word]);

  useEffect(() => {
    preload();
  }, [preload]);

  const pronounce = async () => {
    if (playing || !audioUrl.current) return;
    setPlaying(true);

    const audio = new Audio(audioUrl.current);
    audio.volume = 1;
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);

    try {
      await audio.play();
    } catch {
      setPlaying(false);
    }
  };

  if (!hasAudio) return null;

  return (
    <button
      onClick={pronounce}
      disabled={!loaded}
      className={`${SIZE_CLASSES[size]} transition-opacity ${
        playing ? "opacity-50" : "opacity-100 hover:opacity-70"
      }`}
      aria-label={`读 ${word}`}
      title="读音"
    >
      🔊
    </button>
  );
}
