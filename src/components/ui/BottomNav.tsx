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
      <div className="bg-orange-50/95 backdrop-blur-lg border border-orange-200/50 rounded-2xl flex gap-1 px-2 py-2 shadow-[0_4px_24px_rgba(249,115,22,0.12)] pointer-events-auto">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-orange-200 text-orange-800 shadow-[inset_0_2px_4px_rgba(249,115,22,0.1)]"
                  : "text-orange-400 hover:text-orange-600 hover:bg-orange-100/50"
              }`}
            >
              {active && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs">
                  🐾
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
