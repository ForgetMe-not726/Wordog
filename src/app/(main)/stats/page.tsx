"use client";

import { useEffect, useState } from "react";

interface StatsData {
  checkInDates: string[];
  streak: number;
  stats: {
    learnedWords: number;
    inReview: number;
    mastered: number;
    totalEngaged: number;
    todayLearned: number;
    todayReview: number;
    todayTotal: number;
  };
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

function getMonthGrid(year: number, month: number, checkedSet: Set<string>) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  const cells: { day: number; key: string; checked: boolean; isToday: boolean; inMonth: boolean }[] = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push({ day: 0, key: "", checked: false, isToday: false, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${month + 1}-${d}`;
    cells.push({ day: d, key, checked: checkedSet.has(key), isToday: key === todayKey, inMonth: true });
  }
  return cells;
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const fetchStats = () => {
    setLoading(true);
    setError(false);
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-100 to-orange-50">
        <div className="w-8 h-8 border-3 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-100 to-orange-50 p-4">
        <div className="text-center space-y-3">
          <p className="text-4xl">😿</p>
          <p className="text-gray-500 text-sm">加载失败</p>
          <button onClick={fetchStats} className="bg-orange-500 text-white rounded-xl px-6 py-2 text-sm font-bold">
            重试
          </button>
        </div>
      </div>
    );
  }

  const s = data?.stats;
  const checkedSet = new Set(data?.checkInDates ?? []);
  const cells = getMonthGrid(viewYear, viewMonth, checkedSet);
  const canGoNext = viewYear < now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth < now.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">统计</h1>

      {/* Top row: streak + today */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 text-center">
          <p className="text-[11px] text-gray-400 mb-0.5">连续天数</p>
          <p className="text-2xl font-bold text-amber-500">{data?.streak ?? 0}</p>
          <p className="text-[10px] text-gray-300">天</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 text-center">
          <p className="text-[11px] text-gray-400 mb-0.5">今日学习</p>
          <p className="text-2xl font-bold text-orange-500">{s?.todayTotal ?? 0}</p>
          <p className="text-[10px] text-gray-300">{s?.todayLearned ?? 0} 新 · {s?.todayReview ?? 0} 复</p>
        </div>
      </div>

      {/* Calendar + stats side by side */}
      <div className="flex gap-3">
        {/* Left: Calendar */}
        <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-gray-50 shrink-0">
          {/* Month nav */}
          <div className="flex items-center justify-between px-0.5 mb-1">
            <button onClick={prevMonth} className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 text-sm">‹</button>
            <span className="text-xs font-bold text-gray-600">{MONTHS[viewMonth].slice(0,2)} {viewYear}</span>
            <button onClick={nextMonth} disabled={!canGoNext}
              className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 text-sm disabled:opacity-30">›</button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-0.5">
            {WEEKDAYS.map((d) => (
              <div key={d} className="w-[22px] text-center text-[9px] text-gray-300 leading-5">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-px">
            {cells.map((cell, i) => (
              <div key={i} className="w-5 h-5 flex items-center justify-center">
                {cell.inMonth && (
                  <span className={`inline-flex items-center justify-center w-[22px] h-[22px] rounded-full text-[11px] ${
                    cell.checked ? "bg-orange-400 text-white"
                    : cell.isToday ? "bg-amber-100 text-amber-700"
                    : "text-gray-500"
                  }`}>
                    {cell.day}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: word stats stacked */}
        <div className="flex-1 space-y-2">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">📚 已学词汇</span>
            <span className="text-lg font-bold text-orange-500">{s?.learnedWords ?? 0}</span>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">📝 复习中</span>
            <span className="text-lg font-bold text-blue-500">{s?.inReview ?? 0}</span>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">✅ 已掌握</span>
            <span className="text-lg font-bold text-purple-500">{s?.mastered ?? 0}</span>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[11px] text-gray-400">📈 进度</span>
              <span className="text-[11px] text-gray-400">
                {s && s.totalEngaged > 0 ? Math.round((s.learnedWords / s.totalEngaged) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-300 to-orange-400 rounded-full transition-all duration-700"
                style={{ width: `${s && s.totalEngaged > 0 ? Math.round((s.learnedWords / Math.max(s.totalEngaged, 1)) * 100) : 0}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
