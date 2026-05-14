import BottomNav from "@/components/ui/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-green-50/80 to-amber-50/20 pb-24">
      {children}
      <BottomNav />
    </div>
  );
}
