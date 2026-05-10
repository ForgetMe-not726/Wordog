import BottomNav from "@/components/ui/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-green-50 pb-16">
      {children}
      <BottomNav />
    </div>
  );
}
