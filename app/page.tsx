"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type ResponseItem = {
  time: string;
  score: string;
  text: string;
};

type Question = {
  title: string;
  metric: string;
  detail: string;
  answers: ResponseItem[];
};

type Table = {
  id: number;
  scans: number;
  responses: number;
  rating: string;
  lastScan: string;
  status: "Activ" | "Linistit" | "Nou";
  latest: ResponseItem[];
  questions: Question[];
};

const tables: Table[] = [
  {
    id: 12,
    scans: 48,
    responses: 18,
    rating: "4.8",
    lastScan: "21:44",
    status: "Activ",
    latest: [
      { time: "21:44", score: "5/5", text: "Servire foarte buna" },
      { time: "21:31", score: "5/5", text: "Totul a fost rapid" },
      { time: "21:08", score: "4/5", text: "Muzica putin tare" },
    ],
    questions: [
      {
        title: "Cum a fost servirea?",
        metric: "5/5",
        detail: "12 raspunsuri pozitive",
        answers: [
          { time: "21:44", score: "5/5", text: "Servire foarte buna" },
          { time: "20:58", score: "5/5", text: "Chelnerul a fost atent" },
        ],
      },
      {
        title: "Cat de rapid a venit comanda?",
        metric: "5/5",
        detail: "Timp perceput foarte bun",
        answers: [
          { time: "21:31", score: "5/5", text: "Totul a fost rapid" },
          { time: "20:46", score: "5/5", text: "Comanda a venit repede" },
        ],
      },
      {
        title: "Cum a fost atmosfera?",
        metric: "4/5",
        detail: "Un raspuns semnaleaza volum ridicat",
        answers: [
          { time: "21:08", score: "4/5", text: "Muzica putin tare" },
          { time: "20:12", score: "5/5", text: "Atmosfera placuta" },
        ],
      },
      {
        title: "Ati recomanda restaurantul?",
        metric: "94%",
        detail: "17 din 18 raspunsuri sunt da",
        answers: [
          { time: "21:44", score: "Da", text: "As reveni cu prietenii" },
          { time: "19:55", score: "Da", text: "Experienta buna per total" },
        ],
      },
    ],
  },
  {
    id: 7,
    scans: 35,
    responses: 11,
    rating: "4.6",
    lastScan: "21:36",
    status: "Activ",
    latest: [
      { time: "21:36", score: "5/5", text: "Pastele au fost excelente" },
      { time: "20:27", score: "4/5", text: "Ar mai merge un desert" },
      { time: "20:02", score: "5/5", text: "Ambianta calma" },
    ],
    questions: [
      {
        title: "Cum a fost mancarea?",
        metric: "5/5",
        detail: "Cel mai bun scor al serii",
        answers: [
          { time: "21:36", score: "5/5", text: "Pastele au fost excelente" },
          { time: "19:48", score: "5/5", text: "Gust si plating bune" },
        ],
      },
      {
        title: "Cum a fost servirea?",
        metric: "4/5",
        detail: "Feedback stabil",
        answers: [
          { time: "20:27", score: "4/5", text: "Ar mai merge un desert" },
          { time: "20:02", score: "5/5", text: "Ambianta calma" },
        ],
      },
    ],
  },
  {
    id: 4,
    scans: 21,
    responses: 8,
    rating: "4.2",
    lastScan: "20:51",
    status: "Linistit",
    latest: [
      { time: "20:51", score: "4/5", text: "Masa curata si comoda" },
      { time: "19:40", score: "4/5", text: "Asteptare un pic lunga" },
      { time: "18:58", score: "5/5", text: "Personal prietenos" },
    ],
    questions: [
      {
        title: "Cat de confortabila a fost masa?",
        metric: "4/5",
        detail: "Feedback bun pe zona de confort",
        answers: [
          { time: "20:51", score: "4/5", text: "Masa curata si comoda" },
          { time: "18:58", score: "5/5", text: "Personal prietenos" },
        ],
      },
      {
        title: "Cat de repede ati fost serviti?",
        metric: "4/5",
        detail: "O mentiune despre asteptare",
        answers: [
          { time: "19:40", score: "4/5", text: "Asteptare un pic lunga" },
          { time: "18:20", score: "4/5", text: "Acceptabil la ora aglomerata" },
        ],
      },
    ],
  },
  {
    id: 15,
    scans: 12,
    responses: 3,
    rating: "5.0",
    lastScan: "21:12",
    status: "Nou",
    latest: [
      { time: "21:12", score: "5/5", text: "Totul perfect" },
      { time: "20:05", score: "5/5", text: "Recomand" },
      { time: "18:44", score: "5/5", text: "Foarte bun burgerul" },
    ],
    questions: [
      {
        title: "Ati recomanda restaurantul?",
        metric: "100%",
        detail: "Primele raspunsuri sunt excelente",
        answers: [
          { time: "21:12", score: "Da", text: "Totul perfect" },
          { time: "20:05", score: "Da", text: "Recomand" },
        ],
      },
      {
        title: "Cum a fost mancarea?",
        metric: "5/5",
        detail: "Scor maxim pe primele scanari",
        answers: [
          { time: "18:44", score: "5/5", text: "Foarte bun burgerul" },
          { time: "20:05", score: "5/5", text: "Portii generoase" },
        ],
      },
    ],
  },
];

const statusStyles = {
  Activ: "bg-[#D5333C] text-white",
  Linistit: "bg-[#7E8C6A] text-white",
  Nou: "bg-[#F8ECCC] text-[#7B1D22]",
};

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  const [selectedTableId, setSelectedTableId] = useState(12);
  const [questionsOpen, setQuestionsOpen] = useState(false);

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? tables[0],
    [selectedTableId],
  );

  const totalResponses = tables.reduce((sum, table) => sum + table.responses, 0);
  const totalScans = tables.reduce((sum, table) => sum + table.scans, 0);

  function selectTable(id: number) {
    setSelectedTableId(id);
    setQuestionsOpen(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F1E6] text-[#211B18]">
      <div className="flex min-h-screen">
        <aside className="hidden w-24 shrink-0 border-r border-[#E6D6B9] bg-[#FFF9EF] px-3 py-6 lg:block">
          <div className="mb-8 rounded-lg bg-[#7B1D22] px-3 py-4 text-center text-sm font-black leading-tight text-white">
            QR
            <br />
            App
          </div>
          <nav className="space-y-3" aria-label="Mese">
            {tables.map((table) => (
              <button
                className={classNames(
                  "flex h-11 w-full items-center justify-center rounded-lg border text-sm font-bold transition",
                  selectedTable.id === table.id
                    ? "border-[#D8B56F] bg-[#FFF2CD] text-[#7B1D22] shadow-sm"
                    : "border-[#E8D9BE] bg-white text-[#6C6259] hover:border-[#D8B56F]",
                )}
                key={table.id}
                onClick={() => selectTable(table.id)}
                type="button"
              >
                {table.id}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-6 lg:pr-[420px]">
          <header className="mb-6 flex flex-col gap-4 border-b border-[#E5D5B8] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8D7560]">
                Feedback QR
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-[#211B18] sm:text-4xl">
                Mese si raspunsuri
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <Link
                className="flex items-center justify-center rounded-lg bg-[#D5333C] px-4 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(213,51,60,0.18)] transition hover:bg-[#B92731] focus:outline-none focus:ring-2 focus:ring-[#D5333C] focus:ring-offset-2 focus:ring-offset-[#F7F1E6]"
                href="/feedback"
              >
                Formular public
              </Link>
              <Metric label="Scanari" value={String(totalScans)} />
              <Metric label="Raspunsuri" value={String(totalResponses)} />
              <Metric label="Rating mediu" value="4.7" />
            </div>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {tables.map((table) => (
              <button
                className={classNames(
                  "group min-h-44 rounded-lg border bg-white p-4 text-left shadow-[0_12px_30px_rgba(91,59,21,0.06)] transition hover:-translate-y-0.5 hover:border-[#D8B56F] focus:outline-none focus:ring-2 focus:ring-[#D5333C] focus:ring-offset-2 focus:ring-offset-[#F7F1E6]",
                  selectedTable.id === table.id
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
                  <span className="font-black text-[#211B18]">{table.lastScan}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

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
    </main>
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

function SmallMetric({ label, value }: { label: string; value: string | number }) {
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
