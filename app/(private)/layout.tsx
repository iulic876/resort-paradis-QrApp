import { PrivateSidebar } from "@/components/private/PrivateSidebar";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F1E6] text-[#211B18]">
      <PrivateSidebar />
      <main className="min-h-screen lg:pl-[240px]">{children}</main>
    </div>
  );
}
