"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { TablesList, type TableListItem } from "@/components/private/TablesList";

export type HallTable = TableListItem;

type ResponseItem = {
  id: string;
  rating: number | null;
  comment: string | null;
  createdAt: string;
};

type QuestionSummary = {
  questionId: string;
  responseCount: number;
  average: number | null;
  optionCounts: Record<string, number>;
};

type QuestionType = "RATING" | "SINGLE_CHOICE" | "TEXT" | "NPS";

type TemplateQuestion = {
  id: string;
  title: string;
  type: QuestionType;
  helper: string | null;
  options: string[] | null;
  required: boolean;
};

type TemplateOption = {
  id: string;
  name: string;
  questions: TemplateQuestion[];
};

const typeLabels: Record<QuestionType, string> = {
  RATING: "rating",
  SINGLE_CHOICE: "single",
  TEXT: "text",
  NPS: "nps",
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
  hallId,
  hallName,
  tables: initialTables,
}: {
  hallId: string;
  hallName: string;
  tables: HallTable[];
}) {
  const router = useRouter();
  const [tables, setTables] = useState(initialTables);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(
    initialTables[0]?.id ?? null,
  );
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [summary, setSummary] = useState<QuestionSummary[] | null>(null);
  const [templates, setTemplates] = useState<TemplateOption[] | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [name, setName] = useState(hallName);
  const [deletingHall, setDeletingHall] = useState(false);
  const [hallError, setHallError] = useState<string | null>(null);

  async function saveHallName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === hallName) {
      setName(hallName);
      return;
    }
    setHallError(null);
    try {
      const response = await fetch(`/api/halls/${hallId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) throw new Error(json?.error ?? "Nu am putut salva numele");
      router.refresh();
    } catch (err) {
      setName(hallName);
      setHallError(err instanceof Error ? err.message : "Nu am putut salva numele");
    }
  }

  async function deleteHall() {
    if (
      !confirm(
        `Stergi sala "${hallName}" impreuna cu toate mesele ei? Aceasta actiune nu poate fi anulata.`,
      )
    ) {
      return;
    }
    setDeletingHall(true);
    setHallError(null);
    try {
      const response = await fetch(`/api/halls/${hallId}`, { method: "DELETE" });
      if (!response.ok && response.status !== 204) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.error ?? "Nu am putut sterge sala");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setDeletingHall(false);
      setHallError(err instanceof Error ? err.message : "Nu am putut sterge sala");
    }
  }

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [tables, selectedTableId],
  );

  const questionTitles = useMemo(() => {
    const map = new Map<string, string>();
    for (const template of templates ?? []) {
      for (const question of template.questions) {
        map.set(question.id, question.title);
      }
    }
    return map;
  }, [templates]);

  function handleTableCreated(table: HallTable) {
    setTables((prev) => [...prev, table]);
    selectTable(table.id);
  }

  function handleTableDeleted(tableId: string) {
    setTables((prev) => prev.filter((table) => table.id !== tableId));
    if (selectedTableId === tableId) {
      setSelectedTableId(null);
      setQuestionsOpen(false);
    }
  }

  function handleTemplateAssigned(tableId: string, templateId: string | null) {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, templateId } : table,
      ),
    );
  }

  function handleQrGenerated(tableId: string) {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, qrStatus: "activ" } : table,
      ),
    );
  }

  useEffect(() => {
    let cancelled = false;
    async function loadTemplates() {
      setLoadingTemplates(true);
      try {
        const response = await fetch("/api/question-templates");
        const json = await response.json();
        if (!cancelled) setTemplates(response.ok ? json.data : []);
      } catch {
        if (!cancelled) setTemplates([]);
      } finally {
        if (!cancelled) setLoadingTemplates(false);
      }
    }
    loadTemplates();
    return () => {
      cancelled = true;
    };
  }, []);

  function openQuestions() {
    setQuestionsOpen(true);
  }

  async function selectTable(id: string) {
    setSelectedTableId(id);
    setQuestionsOpen(false);
    setLoadingResponses(true);
    setSummary(null);
    try {
      const [responsesResult, summaryResult] = await Promise.all([
        fetch(`/api/tables/${id}/responses?pageSize=5`),
        fetch(`/api/tables/${id}/responses/summary`),
      ]);
      const responsesJson = await responsesResult.json();
      setResponses(responsesResult.ok ? responsesJson.data : []);
      const summaryJson = await summaryResult.json();
      setSummary(summaryResult.ok ? summaryJson.data : []);
    } catch {
      setResponses([]);
      setSummary([]);
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
            <input
              className="mt-2 w-full min-w-0 border-b-2 border-transparent bg-transparent text-3xl font-black leading-tight text-[#211B18] transition focus:border-[#D5333C] focus:outline-none sm:text-4xl"
              onBlur={saveHallName}
              onChange={(event) => setName(event.target.value)}
              type="text"
              value={name}
            />
            {hallError && (
              <p className="mt-1 text-xs text-[#B3261E]">{hallError}</p>
            )}
          </div>
          <button
            className="shrink-0 rounded-lg border border-[#E8B4B4] px-3 py-1.5 text-xs font-semibold text-[#B3261E] transition hover:bg-[#FBEAEA] disabled:opacity-60"
            disabled={deletingHall}
            onClick={deleteHall}
            type="button"
          >
            {deletingHall ? "Se sterge..." : "Sterge sala"}
          </button>
        </header>

        {tables.length === 0 ? (
          <p className="text-sm text-[#776D64]">
            Nu exista mese configurate pentru aceasta sala.
          </p>
        ) : (
          <div className="w-full">
            <TablesList
              hallId={hallId}
              onSelectTable={selectTable}
              onTableCreated={handleTableCreated}
              onTableDeleted={handleTableDeleted}
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
            onOpenQuestions={openQuestions}
            onQrGenerated={() => handleQrGenerated(selectedTable.id)}
            questionsOpen={questionsOpen}
            questionTitles={questionTitles}
            responses={responses}
            summary={summary}
            table={selectedTable}
          />
          <QuestionsDrawer
            loadingTemplates={loadingTemplates}
            onAssigned={(templateId) =>
              handleTemplateAssigned(selectedTable.id, templateId)
            }
            onClose={() => setQuestionsOpen(false)}
            open={questionsOpen}
            table={selectedTable}
            templates={templates ?? []}
          />
        </>
      )}
    </div>
  );
}

function TableDrawer({
  onOpenQuestions,
  onQrGenerated,
  questionsOpen,
  table,
  responses,
  loadingResponses,
  summary,
  questionTitles,
}: {
  onOpenQuestions: () => void;
  onQrGenerated: () => void;
  questionsOpen: boolean;
  table: HallTable;
  responses: ResponseItem[];
  loadingResponses: boolean;
  summary: QuestionSummary[] | null;
  questionTitles: Map<string, string>;
}) {
  const [generatingQr, setGeneratingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  async function generateQr() {
    setGeneratingQr(true);
    setQrError(null);
    try {
      const response = await fetch(`/api/tables/${table.id}/qr`, {
        method: "POST",
      });
      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.error ?? "Nu am putut genera QR-ul");
      }
      onQrGenerated();
    } catch (err) {
      setQrError(err instanceof Error ? err.message : "Nu am putut genera QR-ul");
    } finally {
      setGeneratingQr(false);
    }
  }

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

        <div className="flex items-start gap-5">
          {table.qrStatus === "activ" ? (
            <div className="relative h-[220px] w-[110px] shrink-0 overflow-hidden rounded-md border border-[#E8D9BE] bg-[#FFF9EF]">
              <Image
                alt={`Card QR ${table.name}`}
                className="object-contain"
                fill
                priority
                sizes="110px"
                src={`/api/tables/${table.id}/qr/download`}
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-[220px] w-[110px] shrink-0 items-center justify-center rounded-md border border-[#E8D9BE] bg-[#FFF9EF] text-center text-xs text-[#9A8C7A]">
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
              {table.templateId ? "Vezi intrebarile" : "Asigneaza sablon"}
            </button>
            {table.qrStatus === "activ" ? (
              <a
                className="rounded-lg bg-[#D5333C] px-4 py-3 text-center text-sm font-black text-white transition hover:bg-[#B92731] focus:outline-none focus:ring-2 focus:ring-[#D5333C] focus:ring-offset-2"
                href={`/api/tables/${table.id}/qr/download`}
              >
                Descarca QR
              </a>
            ) : (
              <button
                className="rounded-lg border border-[#D8B56F] px-4 py-3 text-sm font-black text-[#7B1D22] transition hover:bg-[#FFF2CD] disabled:opacity-60"
                disabled={generatingQr}
                onClick={generateQr}
                type="button"
              >
                {generatingQr ? "Se genereaza..." : "Genereaza QR"}
              </button>
            )}
          </div>
        </div>

        {qrError && <p className="mt-2 text-xs text-[#B3261E]">{qrError}</p>}

        <div className="my-6 border-t border-[#E6D6B9]" />

        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          <Stat label="Scanari" value={table.scans} />
          <Stat label="Raspunsuri" value={table.responses} />
          <Stat label="Status" value={table.status} />
          <Stat label="Ultima scanare" value={formatTime(table.lastScan)} />
        </div>

        {summary && summary.length > 0 && (
          <>
            <div className="my-7 border-t border-[#E6D6B9]" />
            <section>
              <h3 className="mb-4 text-lg font-black">Statistici pe intrebari</h3>
              <div className="space-y-3">
                {summary.map((item) => (
                  <div
                    className="rounded-lg border border-[#E8D9BE] bg-[#FFF9EF] px-4 py-3"
                    key={item.questionId}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-[#211B18]">
                        {questionTitles.get(item.questionId) ?? "Intrebare"}
                      </p>
                      <span className="shrink-0 text-xs text-[#9A8C7A]">
                        {item.responseCount} raspunsuri
                      </span>
                    </div>
                    {item.average !== null && (
                      <p className="mt-1 text-sm text-[#7B1D22]">
                        Medie: {item.average.toFixed(1)}
                      </p>
                    )}
                    {Object.keys(item.optionCounts).length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {Object.entries(item.optionCounts).map(([option, count]) => (
                          <p className="text-sm text-[#776D64]" key={option}>
                            {option}: {count}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

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
  templates,
  loadingTemplates,
  onAssigned,
}: {
  onClose: () => void;
  open: boolean;
  table: HallTable;
  templates: TemplateOption[];
  loadingTemplates: boolean;
  onAssigned: (templateId: string | null) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTemplate = templates.find(
    (template) => template.id === table.templateId,
  );

  async function assignTemplate(templateId: string | null) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/tables/${table.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) throw new Error(json?.error ?? "Nu am putut salva sablonul");
      onAssigned(templateId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut salva sablonul");
    } finally {
      setSaving(false);
    }
  }

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
        <div className="flex h-full flex-col overflow-y-auto">
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

          <label className="text-xs font-semibold text-[#9A8C7A]" htmlFor="template-select">
            Sablon asignat mesei
          </label>
          <select
            className="mt-1.5 w-full rounded-lg border border-[#E8D9BE] bg-[#FFF9EF] px-3 py-2.5 text-sm font-semibold text-[#211B18] focus:outline-none focus:ring-2 focus:ring-[#D5333C] disabled:opacity-60"
            disabled={saving || loadingTemplates}
            id="template-select"
            onChange={(event) => assignTemplate(event.target.value || null)}
            value={table.templateId ?? ""}
          >
            <option value="">Fara sablon (foloseste fallback-ul salii)</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>

          {error && <p className="mt-2 text-xs text-[#B3261E]">{error}</p>}

          <div className="my-6 border-t border-[#E6D6B9]" />

          {loadingTemplates ? (
            <p className="text-sm text-[#776D64]">Se incarca...</p>
          ) : !table.templateId ? (
            <p className="text-sm text-[#776D64]">
              Aceasta masa nu are un sablon propriu. Alege unul din lista de
              mai sus sau gestioneaza sabloanele din pagina{" "}
              <a className="font-semibold text-[#7B1D22] underline" href="/intrebari">
                Toate intrebarile
              </a>
              .
            </p>
          ) : !activeTemplate ? (
            <p className="text-sm text-[#776D64]">Sablonul nu a putut fi gasit.</p>
          ) : activeTemplate.questions.length === 0 ? (
            <p className="text-sm text-[#776D64]">
              Sablonul &quot;{activeTemplate.name}&quot; nu are inca intrebari.
            </p>
          ) : (
            <div className="space-y-3">
              {activeTemplate.questions.map((question) => (
                <div
                  className="rounded-lg border border-[#E8D9BE] bg-[#FFF9EF] px-4 py-3"
                  key={question.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#211B18]">{question.title}</p>
                    <span className="rounded-md bg-[#F5E6C4] px-2 py-0.5 text-xs font-semibold text-[#7B1D22]">
                      {typeLabels[question.type]}
                    </span>
                    {question.required && (
                      <span className="rounded-md bg-[#FBEAEA] px-2 py-0.5 text-xs font-semibold text-[#B3261E]">
                        required
                      </span>
                    )}
                  </div>
                  {question.helper && (
                    <p className="mt-1 text-sm text-[#776D64]">{question.helper}</p>
                  )}
                  {question.type === "SINGLE_CHOICE" && question.options && question.options.length > 0 && (
                    <p className="mt-1 text-xs text-[#9A8C7A]">
                      Optiuni: {question.options.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
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
