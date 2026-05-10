"use client";

import { motion, type TargetAndTransition } from "framer-motion";

interface DogDisplayProps {
  name: string;
  mood: number;
}

const moodAnimations: Record<string, TargetAndTransition> = {
  happy: {
    y: [0, -12, 0],
    transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
  },
  idle: {
    rotate: [0, 2, 0, -2, 0],
    transition: { repeat: Infinity, duration: 4, ease: "easeInOut" },
  },
  sad: {
    y: [0, -3, 0],
    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
  },
};

export default function DogDisplay({ name, mood }: DogDisplayProps) {
  const moodKey = mood >= 60 ? "happy" : mood >= 30 ? "idle" : "sad";

  return (
    <div className="text-center select-none">
      <motion.div
        className="text-8xl"
        animate={moodAnimations[moodKey]}
      >
        🐕
      </motion.div>
      <p className="text-lg font-bold text-gray-700 mt-2">{name}</p>
    </div>
  );
}
