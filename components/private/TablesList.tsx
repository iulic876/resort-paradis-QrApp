"use client";

import { FormEvent, MouseEvent, useMemo, useState } from "react";

export type TableListItem = {
  id: string;
  name: string;
  number: number;
  status: "ACTIVE" | "QUIET" | "NEW";
  templateId: string | null;
  qrStatus: "activ" | "lipsa";
  qrToken: string | null;
  scans: number;
  responses: number;
  lastScan: string | null;
};

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function TablesList({
  hallId,
  tables,
  selectedTableId,
  onSelectTable,
  onTableCreated,
  onTableDeleted,
}: {
  hallId: string;
  tables: TableListItem[];
  selectedTableId: string | null;
  onSelectTable: (id: string) => void;
  onTableCreated: (table: TableListItem) => void;
  onTableDeleted: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [addingOpen, setAddingOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteTable(event: MouseEvent, table: TableListItem) {
    event.stopPropagation();
    if (!confirm(`Stergi masa "${table.name}"? Aceasta actiune nu poate fi anulata.`)) {
      return;
    }
    setDeletingId(table.id);
    try {
      const response = await fetch(`/api/tables/${table.id}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.error ?? "Nu am putut sterge masa");
      }
      onTableDeleted(table.id);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Nu am putut sterge masa");
    } finally {
      setDeletingId(null);
    }
  }

  async function submitNewTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newTableName.trim();
    if (!name) return;

    setCreating(true);
    setCreateError(null);
    try {
      const response = await fetch(`/api/halls/${hallId}/tables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(json?.error ?? "Nu am putut adauga masa");
      }
      onTableCreated({
        id: json.data.id,
        name: json.data.name,
        number: json.data.number,
        status: json.data.status,
        templateId: json.data.templateId ?? null,
        qrStatus: "lipsa",
        qrToken: null,
        scans: 0,
        responses: 0,
        lastScan: null,
      });
      setNewTableName("");
      setAddingOpen(false);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Nu am putut adauga masa",
      );
    } finally {
      setCreating(false);
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tables;
    return tables.filter(
      (table) =>
        table.name.toLowerCase().includes(query) ||
        String(table.number).includes(query),
    );
  }, [tables, search]);

  return (
    <div className="w-full rounded-xl border border-[#E8D9BE] bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-[#211B18]">Lista mese</h2>
        <button
          className="flex items-center gap-1.5 rounded-lg border border-[#D8B56F] px-3 py-1.5 text-sm font-semibold text-[#7B1D22] transition hover:bg-[#FFF2CD]"
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
          Adauga masa
        </button>
      </div>

      {addingOpen && (
        <form
          className="mt-4 flex flex-col gap-2 rounded-lg border border-[#E8D9BE] bg-[#FFF9EF] p-3 sm:flex-row sm:items-center"
          onSubmit={submitNewTable}
        >
          <input
            autoFocus
            className="flex-1 rounded-lg border border-[#E8D9BE] bg-white px-3 py-2 text-sm text-[#211B18] placeholder:text-[#9A8C7A] focus:outline-none focus:ring-2 focus:ring-[#D5333C]"
            onChange={(event) => setNewTableName(event.target.value)}
            placeholder="Denumire masa noua..."
            type="text"
            value={newTableName}
          />
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-[#D5333C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#B92731] disabled:opacity-60"
              disabled={creating || !newTableName.trim()}
              type="submit"
            >
              {creating ? "Se adauga..." : "Adauga"}
            </button>
            <button
              className="rounded-lg border border-[#E8D9BE] px-4 py-2 text-sm font-semibold text-[#776D64] transition hover:bg-white"
              onClick={() => {
                setAddingOpen(false);
                setNewTableName("");
                setCreateError(null);
              }}
              type="button"
            >
              Anuleaza
            </button>
          </div>
        </form>
      )}

      {createError && (
        <p className="mt-2 text-sm text-[#B3261E]">{createError}</p>
      )}

      <input
        className="mt-4 w-full rounded-lg border border-[#E8D9BE] bg-[#FFF9EF] px-4 py-2.5 text-sm text-[#211B18] placeholder:text-[#9A8C7A] focus:outline-none focus:ring-2 focus:ring-[#D5333C]"
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Cauta masa..."
        type="text"
        value={search}
      />

      <div className="mt-5 max-h-[560px] overflow-y-auto overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-y-3 text-sm">
          <thead className="sticky top-0 z-10 bg-white">
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
            {filtered.map((table) => {
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
                    M{String(table.number).padStart(2, "0")}
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
                    <div className="flex items-center justify-end gap-3">
                      <button
                        className="text-xs font-semibold text-[#B3261E] transition hover:underline disabled:opacity-60"
                        disabled={deletingId === table.id}
                        onClick={(event) => deleteTable(event, table)}
                        type="button"
                      >
                        {deletingId === table.id ? "..." : "Sterge"}
                      </button>
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
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-[#776D64]">
            Nicio masa gasita.
          </p>
        )}
      </div>

      <p className="mt-4 text-sm text-[#776D64]">
        {filtered.length === 0 ? "0 mese" : `${filtered.length} mese`}
      </p>
    </div>
  );
}
