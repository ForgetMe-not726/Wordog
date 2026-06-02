import BottomNav from "@/components/ui/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-orange-50/80 to-amber-50/30 pb-24">
      {/* Paw print decorations */}
      <span className="fixed top-12 right-6 text-2xl opacity-[0.06] rotate-12 select-none pointer-events-none z-0">🐾</span>
      <span className="fixed top-32 left-4 text-xl opacity-[0.04] -rotate-12 select-none pointer-events-none z-0">🐾</span>
      <span className="fixed bottom-20 right-8 text-xl opacity-[0.04] rotate-45 select-none pointer-events-none z-0">🐾</span>
      {children}
      <BottomNav />
    </div>
  );
}
