"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getHallStats, halls } from "@/lib/halls-data";

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PrivateSidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-[#E6D6B9] bg-[#FFF9EF]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3 overflow-x-auto">
          {halls.map((hall) => {
            const active = pathname === `/${hall.id}`;

            return (
              <Link
                className={classNames(
                  "flex h-9 shrink-0 items-center rounded-md px-3 text-sm transition",
                  active
                    ? "bg-[#F5E6C4] font-semibold text-[#7B1D22]"
                    : "text-[#6C6259] hover:bg-white",
                )}
                href={`/${hall.id}`}
                key={hall.id}
              >
                {hall.label}
              </Link>
            );
          })}
        </div>
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-[#E6D6B9] bg-[#FFF9EF] px-5 py-6 lg:flex">
        <nav className="flex flex-col mt-8" aria-label="Sali">
          {halls.map((hall) => {
            const active = pathname === `/${hall.id}`;
            const stats = getHallStats(hall.id);

            return (
              <Link
                className={classNames(
                  "w-full border-l-2 py-2.5 pl-3 text-left transition",
                  active
                    ? "border-[#7B1D22] text-[#211B18]"
                    : "border-transparent text-[#6C6259] hover:text-[#211B18]",
                )}
                href={`/${hall.id}`}
                key={hall.id}
              >
                <span
                  className={classNames(
                    "block text-sm leading-tight",
                    active ? "font-semibold" : "font-medium",
                  )}
                >
                  {hall.label}
                </span>
                <span className="mt-0.5 block text-xs text-[#9A8C7A]">
                  {stats.tables} mese · {stats.responses} raspunsuri
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
