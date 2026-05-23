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
  icon,
  gradient,
}: {
  label: string;
  value: number;
  max: number;
  icon: string;
  gradient: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{icon}</span>
          <span className="text-xs text-gray-500 font-medium">{label}</span>
        </div>
        <span className="text-xs text-gray-400 tabular-nums">
          {value}/{max}
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full ${gradient} rounded-full transition-all duration-700 ease-out shadow-sm`}
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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 shadow-sm border border-green-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 bg-amber-50 rounded-full px-3 py-1">
          <span className="text-sm">🦴</span>
          <span className="text-sm font-bold text-amber-700">{foodCurrency}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-50 rounded-full px-3 py-1">
          <span className="text-sm">🔥</span>
          <span className="text-xs font-bold text-orange-500">
            {streak} 天连续
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Bar
          label="饱腹"
          value={fullness}
          max={100}
          icon="🍖"
          gradient="bg-gradient-to-r from-green-300 to-emerald-400"
        />
        <Bar
          label="心情"
          value={mood}
          max={100}
          icon="❤️"
          gradient="bg-gradient-to-r from-pink-300 to-rose-400"
        />
      </div>
    </div>
  );
}
