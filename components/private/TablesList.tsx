"use client";

import { useMemo, useState } from "react";

import type { Table } from "@/lib/halls-data";

const PAGE_SIZE = 6;

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function TablesList({
  tables,
  selectedTableId,
  onSelectTable,
}: {
  tables: Table[];
  selectedTableId: number | null;
  onSelectTable: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tables;
    return tables.filter(
      (table) =>
        table.name.toLowerCase().includes(query) ||
        String(table.id).includes(query),
    );
  }, [tables, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  function updateSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  return (
    <div className="w-full rounded-xl border border-[#E8D9BE] bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-[#211B18]">Lista mese</h2>
        <button
          className="flex items-center gap-1.5 rounded-lg border border-[#D8B56F] px-3 py-1.5 text-sm font-semibold text-[#7B1D22] transition hover:bg-[#FFF2CD]"
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
          Adauga masa
        </button>
      </div>

      <input
        className="mt-4 w-full rounded-lg border border-[#E8D9BE] bg-[#FFF9EF] px-4 py-2.5 text-sm text-[#211B18] placeholder:text-[#9A8C7A] focus:outline-none focus:ring-2 focus:ring-[#D5333C]"
        onChange={(event) => updateSearch(event.target.value)}
        placeholder="Cauta masa..."
        type="text"
        value={search}
      />

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-y-3 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold text-[#9A8C7A]">
              <th className="pl-4 font-semibold">Masa</th>
              <th className="font-semibold">Denumire</th>
              <th className="font-semibold">QR</th>
              <th className="font-semibold">Scanari</th>
              <th className="font-semibold">Rasp.</th>
              <th aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {visible.map((table) => {
              const active = table.id === selectedTableId;

              return (
                <tr
                  className={classNames(
                    "cursor-pointer rounded-lg border text-[#211B18] transition",
                    active
                      ? "border-[#D8B56F] bg-[#FFF2CD]"
                      : "border-[#E8D9BE] bg-white hover:border-[#D8B56F]",
                  )}
                  key={table.id}
                  onClick={() => onSelectTable(table.id)}
                >
                  <td className="rounded-l-lg py-3 pl-4 font-black">
                    M{String(table.id).padStart(2, "0")}
                  </td>
                  <td className="py-3">{table.name}</td>
                  <td className="py-3">
                    <span
                      className={classNames(
                        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                        table.qrStatus === "activ"
                          ? "border-[#D8B56F] bg-[#FFF2CD] text-[#7B1D22]"
                          : "border-[#E7B3B3] bg-[#FBEAEA] text-[#B3261E]",
                      )}
                    >
                      {table.qrStatus === "activ" ? "QR activ" : "Print lipsa"}
                    </span>
                  </td>
                  <td className="py-3">{table.scans}</td>
                  <td className="py-3">{table.responses}</td>
                  <td className="rounded-r-lg py-3 pr-4 text-right text-[#9A8C7A]">
                    <svg
                      aria-hidden="true"
                      className="ml-auto h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {visible.length === 0 && (
          <p className="py-6 text-center text-sm text-[#776D64]">
            Nicio masa gasita.
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-[#776D64]">
          {filtered.length === 0
            ? "0 mese"
            : `${currentPage * PAGE_SIZE + 1}-${Math.min(
                (currentPage + 1) * PAGE_SIZE,
                filtered.length,
              )} din ${filtered.length} mese`}
        </p>
        <button
          className="rounded-lg border border-[#D8B56F] px-4 py-2 text-sm font-black text-[#7B1D22] transition hover:bg-[#FFF2CD] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={currentPage >= pageCount - 1}
          onClick={() => setPage((prev) => Math.min(prev + 1, pageCount - 1))}
          type="button"
        >
          Urmatoarele
        </button>
      </div>
    </div>
  );
}
