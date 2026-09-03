"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FormEvent, useState } from "react";

export type SidebarHall = {
  id: string;
  name: string;
  tablesCount: number;
  responsesCount: number;
};

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PrivateSidebar({ halls }: { halls: SidebarHall[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [addingOpen, setAddingOpen] = useState(false);
  const [name, setName] = useState("");
  const [shortLabel, setShortLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function submitNewHall(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedShortLabel = shortLabel.trim();
    if (!trimmedName || !trimmedShortLabel) return;

    setCreating(true);
    setCreateError(null);
    try {
      const response = await fetch("/api/halls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, shortLabel: trimmedShortLabel }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.error ?? "Nu am putut adauga sala");
      }
      setName("");
      setShortLabel("");
      setAddingOpen(false);
      router.push(`/${json.data.id}`);
      router.refresh();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Nu am putut adauga sala",
      );
    } finally {
      setCreating(false);
    }
  }

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
                {hall.name}
              </Link>
            );
          })}
        </div>
      </div>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-[#E6D6B9] bg-[#FFF9EF] px-5 py-6 lg:flex">
        <nav className="flex flex-col mt-8" aria-label="Sali">
          {halls.map((hall) => {
            const active = pathname === `/${hall.id}`;

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
                  {hall.name}
                </span>
                <span className="mt-0.5 block text-xs text-[#9A8C7A]">
                  {hall.tablesCount} mese · {hall.responsesCount} raspunsuri
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          className="mt-4 flex items-center gap-2 pl-3 text-left text-sm font-medium text-[#6C6259] transition hover:text-[#211B18]"
          onClick={() => {
            setAddingOpen((prev) => !prev);
            setCreateError(null);
          }}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Adauga sala
        </button>

        {addingOpen && (
          <form className="mt-3 space-y-2 pl-3" onSubmit={submitNewHall}>
            <input
              autoFocus
              className="w-full rounded-lg border border-[#E8D9BE] bg-white px-3 py-2 text-sm text-[#211B18] placeholder:text-[#9A8C7A] focus:outline-none focus:ring-2 focus:ring-[#D5333C]"
              onChange={(event) => setName(event.target.value)}
              placeholder="Nume sala..."
              type="text"
              value={name}
            />
            <input
              className="w-full rounded-lg border border-[#E8D9BE] bg-white px-3 py-2 text-sm text-[#211B18] placeholder:text-[#9A8C7A] focus:outline-none focus:ring-2 focus:ring-[#D5333C]"
              maxLength={4}
              onChange={(event) => setShortLabel(event.target.value)}
              placeholder="Eticheta scurta (ex: TR)..."
              type="text"
              value={shortLabel}
            />
            {createError && (
              <p className="text-xs text-[#B3261E]">{createError}</p>
            )}
            <div className="flex gap-2">
              <button
                className="rounded-lg bg-[#D5333C] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#B92731] disabled:opacity-60"
                disabled={creating || !name.trim() || !shortLabel.trim()}
                type="submit"
              >
                {creating ? "Se adauga..." : "Adauga"}
              </button>
              <button
                className="rounded-lg border border-[#E8D9BE] px-3 py-1.5 text-xs font-semibold text-[#776D64] transition hover:bg-white"
                onClick={() => {
                  setAddingOpen(false);
                  setName("");
                  setShortLabel("");
                  setCreateError(null);
                }}
                type="button"
              >
                Anuleaza
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 border-t border-[#E6D6B9] pt-4">
          <Link
            className={classNames(
              "block py-1.5 pl-3 text-sm transition",
              pathname === "/intrebari"
                ? "font-semibold text-[#211B18]"
                : "font-medium text-[#6C6259] hover:text-[#211B18]",
            )}
            href="/intrebari"
          >
            Toate intrebarile
          </Link>
        </div>
      </aside>
    </>
  );
}
