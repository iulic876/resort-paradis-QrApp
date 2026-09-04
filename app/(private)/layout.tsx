import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminDatabaseUnavailable } from "@/components/private/AdminDatabaseUnavailable";
import { PrivateSidebar } from "@/components/private/PrivateSidebar";
import { ADMIN_SESSION_COOKIE, isAdminSessionValid } from "@/lib/auth";
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
  const cookieStore = await cookies();
  const isAuthenticated = await isAdminSessionValid(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (!isAuthenticated) {
    redirect("/login");
  }

  let halls;
  try {
    halls = await getSidebarHalls();
  } catch {
    return <AdminDatabaseUnavailable />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F1E6] text-[#211B18]">
      <PrivateSidebar halls={halls} />
      <main className="min-h-screen min-w-0 lg:pl-[240px]">{children}</main>
    </div>
  );
}
