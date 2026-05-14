"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/home", label: "首页", icon: "🐕" },
  { href: "/learn", label: "学习", icon: "📖" },
  { href: "/stats", label: "统计", icon: "📊" },
  { href: "/me", label: "我的", icon: "🐾" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-lg border border-green-100/50 rounded-2xl flex gap-1 px-2 py-2 shadow-lg shadow-green-200/30 pointer-events-auto">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-emerald-100 text-emerald-700 scale-105"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              {active && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs scale-50">
                  🦴
                </span>
              )}
              <span className="text-lg">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
