"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  getHall,
  getHallTables,
  type ResponseItem,
  type Table,
} from "@/lib/halls-data";

const statusStyles = {
  Activ: "bg-[#D5333C] text-white",
  Linistit: "bg-[#7E8C6A] text-white",
  Nou: "bg-[#F8ECCC] text-[#7B1D22]",
};

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function HallPage() {
  const params = useParams<{ hallId: string }>();
  const hall = getHall(params.hallId);
  const hallTables = useMemo(
    () => getHallTables(params.hallId),
    [params.hallId],
  );

  const [selectedTableId, setSelectedTableId] = useState(
    hallTables[0]?.id ?? null,
  );
  const [questionsOpen, setQuestionsOpen] = useState(false);

  const selectedTable = useMemo(
    () =>
      hallTables.find((table) => table.id === selectedTableId) ??
      hallTables[0] ??
      null,
    [hallTables, selectedTableId],
  );

  if (!hall) {
    notFound();
  }

  const totalResponses = hallTables.reduce(
    (sum, table) => sum + table.responses,
    0,
  );
  const totalScans = hallTables.reduce((sum, table) => sum + table.scans, 0);
  const averageRating = hallTables.length
    ? (
        hallTables.reduce((sum, table) => sum + Number(table.rating), 0) /
        hallTables.length
      ).toFixed(1)
    : "-";

  function selectTable(id: number) {
    setSelectedTableId(id);
    setQuestionsOpen(false);
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <section
        className={classNames(
          "flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-6",
          selectedTable && "lg:pr-[420px]",
        )}
      >
        <header className="mb-6 flex flex-col gap-4 pb-5 md:flex-row md:items-end md:justify-between">
          <div>

            <h1 className="mt-2 text-3xl font-black leading-tight text-[#211B18] sm:text-4xl">
              {hall.label}
            </h1>
          </div>

        </header>

        {hallTables.length === 0 ? (
          <p className="text-sm text-[#776D64]">
            Nu exista mese configurate pentru aceasta sala.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {hallTables.map((table) => (
              <button
                className={classNames(
                  "group min-h-44 rounded-lg border bg-white p-4 text-left shadow-[0_12px_30px_rgba(91,59,21,0.06)] transition hover:-translate-y-0.5 hover:border-[#D8B56F] focus:outline-none focus:ring-2 focus:ring-[#D5333C] focus:ring-offset-2 focus:ring-offset-[#F7F1E6]",
                  selectedTable?.id === table.id
                    ? "border-[#D8B56F]"
                    : "border-[#E8D9BE]",
                )}
                key={table.id}
                onClick={() => selectTable(table.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8D7560]">
                      Masa
                    </p>
                    <h2 className="mt-1 text-2xl font-black">Masa {table.id}</h2>
                  </div>
                  <span
                    className={classNames(
                      "rounded-md px-2.5 py-1 text-xs font-bold",
                      statusStyles[table.status],
                    )}
                  >
                    {table.status}
                  </span>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">
                  <SmallMetric label="Scanari" value={table.scans} />
                  <SmallMetric label="Rasp." value={table.responses} />
                  <SmallMetric label="Rating" value={table.rating} />
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#F0E5D2] pt-4 text-sm">
                  <span className="text-[#776D64]">Ultima scanare</span>
                  <span className="font-black text-[#211B18]">
                    {table.lastScan}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedTable && (
        <>
          <TableDrawer
            onOpenQuestions={() => setQuestionsOpen(true)}
            questionsOpen={questionsOpen}
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#E8D9BE] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(91,59,21,0.05)]">
      <p className="text-xs text-[#776D64]">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-xs text-[#776D64]">{label}</p>
      <p className="mt-1 text-lg font-black text-[#211B18]">{value}</p>
    </div>
  );
}

function TableDrawer({
  onOpenQuestions,
  questionsOpen,
  table,
}: {
  onOpenQuestions: () => void;
  questionsOpen: boolean;
  table: Table;
}) {
  return (
    <aside
      className={classNames(
        "fixed bottom-3 right-3 top-3 z-30 w-[min(356px,calc(100vw-24px))] rounded-lg border border-[#D8B56F] bg-white px-7 py-6 shadow-[0_24px_80px_rgba(70,49,24,0.18)] transition duration-300 sm:right-6 sm:top-6 sm:bottom-6",
        questionsOpen && "scale-[0.985] opacity-70",
      )}
      aria-label={`Detalii Masa ${table.id}`}
    >
      <div className="flex h-full flex-col">
        <div className="mb-5">
          <h2 className="text-3xl font-black leading-none">Masa {table.id}</h2>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative h-[144px] w-[144px] shrink-0 bg-[#FFF9EF]">
            <Image
              alt={`QR Masa ${table.id}`}
              className="object-cover"
              fill
              priority
              sizes="144px"
              src="/qr-masa-12.png"
            />
          </div>

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
            <button
              className="rounded-lg bg-[#D5333C] px-4 py-3 text-sm font-black text-white transition hover:bg-[#B92731] focus:outline-none focus:ring-2 focus:ring-[#D5333C] focus:ring-offset-2"
              type="button"
            >
              Descarca QR
            </button>
          </div>
        </div>

        <div className="my-6 border-t border-[#E6D6B9]" />

        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          <Stat label="Scanari" value={table.scans} />
          <Stat label="Raspunsuri" value={table.responses} />
          <Stat label="Rating" value={table.rating} />
          <Stat label="Ultima scanare" value={table.lastScan} />
        </div>

        <div className="my-7 border-t border-[#E6D6B9]" />

        <section className="min-h-0 flex-1">
          <h3 className="mb-4 text-lg font-black">Ultimele raspunsuri</h3>
          <div className="space-y-3">
            {table.latest.map((item) => (
              <ResponseRow item={item} key={`${item.time}-${item.text}`} />
            ))}
          </div>
        </section>

        <button
          className="mt-2 rounded-lg border border-[#D8B56F] px-4 py-3 text-sm font-black text-[#7B1D22] transition hover:bg-[#FFF2CD] focus:outline-none focus:ring-2 focus:ring-[#D5333C] focus:ring-offset-2"
          type="button"
        >
          Vezi toate raspunsurile mesei
        </button>
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
  table: Table;
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
        aria-label={`Intrebarile Mesei ${table.id}`}
        id="questions-drawer"
      >
        <div className="flex h-full flex-col">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8D7560]">
                Masa {table.id}
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

          <div className="grid grid-cols-2 gap-3 border-y border-[#E6D6B9] py-4">
            <Stat label="Intrebari" value={table.questions.length} />
            <Stat label="Raspunsuri" value={table.responses} />
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-5 pr-1">
            {table.questions.map((question) => (
              <article
                className="rounded-lg border border-[#E8D9BE] bg-[#FFF9EF] p-4"
                key={question.title}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-black leading-snug">
                    {question.title}
                  </h3>
                  <span className="rounded-md bg-[#7B1D22] px-2.5 py-1 text-xs font-black text-white">
                    {question.metric}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-5 text-[#6C6259]">
                  {question.detail}
                </p>

                <div className="mt-4 space-y-2">
                  {question.answers.map((answer) => (
                    <div
                      className="grid grid-cols-[44px_44px_1fr] items-center gap-3 rounded-md border border-[#E8D9BE] bg-white px-3 py-2 text-sm"
                      key={`${question.title}-${answer.time}-${answer.text}`}
                    >
                      <span className="text-xs text-[#776D64]">{answer.time}</span>
                      <span className="font-black text-[#7B1D22]">
                        {answer.score}
                      </span>
                      <span className="truncate text-[#211B18]">{answer.text}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
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
    <div className="grid grid-cols-[46px_42px_1fr] items-center gap-3 rounded-lg border border-[#E8D9BE] bg-[#FFF2CD] px-3 py-3 text-sm first:bg-[#FFF2CD] [&:not(:first-child)]:bg-white">
      <span className="text-xs text-[#776D64]">{item.time}</span>
      <span className="font-black text-[#7B1D22]">{item.score}</span>
      <span className="truncate text-[#211B18]">{item.text}</span>
    </div>
  );
}
