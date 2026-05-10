"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/home", label: "Home", icon: "\u{1F3E0}" },
  { href: "/learn", label: "Learn", icon: "\u{1F4D6}" },
  { href: "/stats", label: "Stats", icon: "\u{1F4CA}" },
  { href: "/me", label: "Profile", icon: "\u{1F464}" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors ${
              active ? "text-green-600" : "text-gray-400"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
