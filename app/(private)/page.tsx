import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export default async function PrivateIndexPage() {
  const firstHall = await prisma.hall.findFirst({
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });

  if (!firstHall) {
    redirect("/intrebari");
  }

  redirect(`/${firstHall.id}`);
}
