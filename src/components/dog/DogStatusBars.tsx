"use client";

interface DogStatusBarsProps {
  foodCurrency: number;
  fullness: number;
  mood: number;
  streak: number;
}

function Bar({
  label,
  value,
  max,
  color,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {icon} {label}
        </span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function DogStatusBars({
  foodCurrency,
  fullness,
  mood,
  streak,
}: DogStatusBarsProps) {
  return (
    <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="font-bold text-gray-700">
          🦴 {foodCurrency}
        </span>
        <span className="text-sm text-orange-400">
          🔥 {streak} day{streak !== 1 ? "s" : ""}
        </span>
      </div>
      <Bar label="Fullness" value={fullness} max={100} color="bg-green-400" icon="🍖" />
      <Bar label="Mood" value={mood} max={100} color="bg-pink-400" icon="❤️" />
    </div>
  );
}
