"use client";

import { motion, type TargetAndTransition } from "framer-motion";

interface Accessory {
  id: string;
  name: string;
  type: string;
  imageUrl: string;
}

interface DogDisplayProps {
  name: string;
  mood: number;
  breed?: string;
  accessories?: Accessory[];
}

const BREED_EMOJI: Record<string, string> = {
  Shiba: "🐕",
  Corgi: "🐶",
};

const TYPE_ICONS: Record<string, string> = {
  hat: "🎩",
  scarf: "🧣",
  glasses: "👓",
  collar: "💫",
  bow: "🎀",
};

const moodConfig = (mood: number) => {
  if (mood >= 60) return {
    animation: {
      y: [0, -16, 0],
      rotate: [0, -5, 0, 5, 0],
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
    } as TargetAndTransition,
    eyeEmoji: "😊",
    label: "开心",
    glowColor: "bg-yellow-200/30",
  };
  if (mood >= 30) return {
    animation: {
      rotate: [0, 2, 0, -2, 0],
      y: [0, -4, 0],
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" },
    } as TargetAndTransition,
    eyeEmoji: "😐",
    label: "平静",
    glowColor: "bg-green-200/20",
  };
  return {
    animation: {
      y: [0, -3, 0],
      rotate: [0, -1, 0, 1, 0],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
    } as TargetAndTransition,
    eyeEmoji: "😢",
    label: "低落",
    glowColor: "bg-blue-200/20",
  };
};

export default function DogDisplay({ name, mood, breed, accessories }: DogDisplayProps) {
  const { animation, eyeEmoji, label, glowColor } = moodConfig(mood);
  const emoji = breed ? (BREED_EMOJI[breed] ?? "🐕") : "🐕";

  return (
    <div className="text-center select-none">
      {/* Dog + accessories */}
      <div className="flex items-center justify-center gap-3">
        {/* Dog */}
        <div className="relative inline-block">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 ${glowColor} rounded-full blur-2xl pointer-events-none`} />

          <motion.div className="text-8xl relative z-10" animate={animation}>
            {emoji}
          </motion.div>

          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-black/10 rounded-full blur-sm" />
        </div>

        {/* Accessories on the right */}
        {accessories && accessories.length > 0 && (
          <div className="flex flex-col gap-1 z-20">
            {accessories.map((a) => (
              <span
                key={a.id}
                className="text-lg bg-white/80 rounded-full w-7 h-7 flex items-center justify-center shadow-sm"
                title={a.name}
              >
                {TYPE_ICONS[a.type] ?? "🎀"}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Name & mood below */}
      <motion.div
        className="mt-5 flex justify-center"
        animate={{ y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-white/60">
          <span className="text-sm">{eyeEmoji}</span>
          <span className="text-sm font-bold text-gray-700">{name}</span>
          <span className="text-[10px] text-gray-400">· {label}</span>
        </span>
      </motion.div>
    </div>
  );
}
