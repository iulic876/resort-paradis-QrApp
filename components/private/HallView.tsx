"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { TablesList, type TableListItem } from "@/components/private/TablesList";

export type HallTable = TableListItem & {
  status: "ACTIVE" | "QUIET" | "NEW";
  lastScan: string | null;
};

type ResponseItem = {
  id: string;
  rating: number | null;
  comment: string | null;
  createdAt: string;
};

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HallView({
  hallName,
  tables,
}: {
  hallName: string;
  tables: HallTable[];
}) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(
    tables[0]?.id ?? null,
  );
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [tables, selectedTableId],
  );

  async function selectTable(id: string) {
    setSelectedTableId(id);
    setQuestionsOpen(false);
    setLoadingResponses(true);
    try {
      const response = await fetch(`/api/tables/${id}/responses?pageSize=5`);
      const json = await response.json();
      setResponses(response.ok ? json.data : []);
    } catch {
      setResponses([]);
    } finally {
      setLoadingResponses(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <section
        className={classNames(
          "flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-6",
          Boolean(selectedTable) && "lg:pr-[420px]",
        )}
      >
        <header className="mb-6 flex flex-col gap-4 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mt-2 text-3xl font-black leading-tight text-[#211B18] sm:text-4xl">
              {hallName}
            </h1>
          </div>
        </header>

        {tables.length === 0 ? (
          <p className="text-sm text-[#776D64]">
            Nu exista mese configurate pentru aceasta sala.
          </p>
        ) : (
          <div className="w-full">
            <TablesList
              onSelectTable={selectTable}
              selectedTableId={selectedTable?.id ?? null}
              tables={tables}
            />
          </div>
        )}
      </section>

      {selectedTable && (
        <>
          <TableDrawer
            loadingResponses={loadingResponses}
            onOpenQuestions={() => setQuestionsOpen(true)}
            questionsOpen={questionsOpen}
            responses={responses}
            table={selectedTable}
          />
          <QuestionsDrawer
            onClose={() => setQuestionsOpen(false)}
            open={questionsOpen}
            table={selectedTable}
          />
        </>
      )}
    </div>
  );
}

function TableDrawer({
  onOpenQuestions,
  questionsOpen,
  table,
  responses,
  loadingResponses,
}: {
  onOpenQuestions: () => void;
  questionsOpen: boolean;
  table: HallTable;
  responses: ResponseItem[];
  loadingResponses: boolean;
}) {
  return (
    <aside
      className={classNames(
        "fixed bottom-3 right-3 top-3 z-30 w-[min(356px,calc(100vw-24px))] rounded-lg border border-[#D8B56F] bg-white px-7 py-6 shadow-[0_24px_80px_rgba(70,49,24,0.18)] transition duration-300 sm:right-6 sm:top-6 sm:bottom-6",
        questionsOpen && "scale-[0.985] opacity-70",
      )}
      aria-label={`Detalii ${table.name}`}
    >
      <div className="flex h-full flex-col">
        <div className="mb-5">
          <h2 className="text-3xl font-black leading-none">{table.name}</h2>
        </div>

        <div className="flex items-center gap-5">
          {table.qrStatus === "activ" ? (
            <div className="relative h-[144px] w-[144px] shrink-0 bg-[#FFF9EF]">
              <Image
                alt={`QR ${table.name}`}
                className="object-cover"
                fill
                priority
                sizes="144px"
                src={`/api/tables/${table.id}/qr/download`}
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-[144px] w-[144px] shrink-0 items-center justify-center bg-[#FFF9EF] text-center text-xs text-[#9A8C7A]">
              QR neasignat
            </div>
          )}

          <div className="flex min-w-0 flex-col gap-3">
            <button
              aria-controls="questions-drawer"
              aria-expanded={questionsOpen}
              className="rounded-lg bg-[#D5333C] px-4 py-3 text-sm font-black text-white transition hover:bg-[#B92731] focus:outline-none focus:ring-2 focus:ring-[#D5333C] focus:ring-offset-2"
              onClick={onOpenQuestions}
              type="button"
            >
              Vezi intrebarile
            </button>
            <a
              className="rounded-lg bg-[#D5333C] px-4 py-3 text-center text-sm font-black text-white transition hover:bg-[#B92731] focus:outline-none focus:ring-2 focus:ring-[#D5333C] focus:ring-offset-2"
              href={`/api/tables/${table.id}/qr/download`}
            >
              Descarca QR
            </a>
          </div>
        </div>

        <div className="my-6 border-t border-[#E6D6B9]" />

        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          <Stat label="Scanari" value={table.scans} />
          <Stat label="Raspunsuri" value={table.responses} />
          <Stat label="Status" value={table.status} />
          <Stat label="Ultima scanare" value={formatTime(table.lastScan)} />
        </div>

        <div className="my-7 border-t border-[#E6D6B9]" />

        <section className="min-h-0 flex-1">
          <h3 className="mb-4 text-lg font-black">Ultimele raspunsuri</h3>
          {loadingResponses ? (
            <p className="text-sm text-[#776D64]">Se incarca...</p>
          ) : responses.length === 0 ? (
            <p className="text-sm text-[#776D64]">Niciun raspuns inca.</p>
          ) : (
            <div className="space-y-3">
              {responses.map((item) => (
                <ResponseRow item={item} key={item.id} />
              ))}
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}

function QuestionsDrawer({
  onClose,
  open,
  table,
}: {
  onClose: () => void;
  open: boolean;
  table: HallTable;
}) {
  return (
    <>
      <div
        className={classNames(
          "fixed inset-0 z-40 bg-[#211B18]/20 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={onClose}
      />
      <aside
        className={classNames(
          "fixed bottom-3 right-3 top-3 z-50 w-[min(356px,calc(100vw-24px))] rounded-lg border border-[#D8B56F] bg-white px-7 py-6 shadow-[0_24px_80px_rgba(70,49,24,0.24)] transition duration-300 sm:right-6 sm:top-6 sm:bottom-6",
          open
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-[calc(100%+32px)] opacity-0",
        )}
        aria-label={`Intrebarile ${table.name}`}
        id="questions-drawer"
      >
        <div className="flex h-full flex-col">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8D7560]">
                {table.name}
              </p>
              <h2 className="mt-1 text-2xl font-black leading-tight">
                Intrebarile mesei
              </h2>
            </div>
            <button
              className="rounded-lg border border-[#E8D9BE] px-3 py-2 text-sm font-black text-[#7B1D22] transition hover:bg-[#FFF2CD] focus:outline-none focus:ring-2 focus:ring-[#D5333C] focus:ring-offset-2"
              onClick={onClose}
              type="button"
            >
              Inchide
            </button>
          </div>

          <p className="text-sm text-[#776D64]">
            Aceasta masa nu are inca un sablon de intrebari asignat. Poti
            gestiona sabloanele din pagina{" "}
            <a className="font-semibold text-[#7B1D22] underline" href="/intrebari">
              Toate intrebarile
            </a>
            .
          </p>
        </div>
      </aside>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-[#776D64]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#211B18]">{value}</p>
    </div>
  );
}

function ResponseRow({ item }: { item: ResponseItem }) {
  return (
    <div className="grid grid-cols-[46px_42px_1fr] items-center gap-3 rounded-lg border border-[#E8D9BE] bg-[#FFF2CD] px-3 py-3 text-sm">
      <span className="text-xs text-[#776D64]">
        {formatTime(item.createdAt)}
      </span>
      <span className="font-black text-[#7B1D22]">
        {item.rating !== null ? `${item.rating}/5` : "—"}
      </span>
      <span className="truncate text-[#211B18]">
        {item.comment ?? "Fara comentariu"}
      </span>
    </div>
  );
}
