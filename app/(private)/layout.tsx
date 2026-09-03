import { PrivateSidebar } from "@/components/private/PrivateSidebar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getSidebarHalls() {
  const halls = await prisma.hall.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { tables: true } },
      tables: { select: { _count: { select: { responses: true } } } },
    },
  });

  return halls.map((hall) => ({
    id: hall.id,
    name: hall.name,
    tablesCount: hall._count.tables,
    responsesCount: hall.tables.reduce(
      (sum, table) => sum + table._count.responses,
      0,
    ),
  }));
}

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const halls = await getSidebarHalls();

  return (
    <div className="min-h-screen bg-[#F7F1E6] text-[#211B18]">
      <PrivateSidebar halls={halls} />
      <main className="min-h-screen lg:pl-[240px]">{children}</main>
    </div>
  );
}
