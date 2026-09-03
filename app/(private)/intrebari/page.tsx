"use client";

import { useMemo, useState } from "react";

import {
  questionTemplates,
  type QuestionType,
  type TemplateQuestion,
} from "@/lib/halls-data";

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const typeLabels: Record<QuestionType, string> = {
  rating: "rating",
  single: "single",
  text: "text",
  nps: "nps",
};

export default function QuestionTemplatesPage() {
  const [templates, setTemplates] = useState(questionTemplates);
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [name, setName] = useState(templates[0]?.name ?? "");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return templates;
    return templates.filter((template) =>
      template.name.toLowerCase().includes(query),
    );
  }, [templates, search]);

  const selected = templates.find((template) => template.id === selectedId) ?? null;

  function selectTemplate(id: string) {
    setSelectedId(id);
    const template = templates.find((item) => item.id === id);
    setName(template?.name ?? "");
  }

  function updateQuestions(
    updater: (questions: TemplateQuestion[]) => TemplateQuestion[],
  ) {
    if (!selected) return;
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === selected.id
          ? { ...template, questions: updater(template.questions) }
          : template,
      ),
    );
  }

  function addQuestion() {
    updateQuestions((questions) => [
      ...questions,
      {
        id: `q-${Date.now()}`,
        title: "Intrebare noua",
        type: "text",
        helper: "raspuns liber optional",
        required: false,
      },
    ]);
  }

  function createTemplate() {
    const id = `template-${Date.now()}`;
    const newTemplate = {
      id,
      name: "Sablon nou",
      badge: "draft",
      tablesCount: 0,
      questions: [],
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    setSelectedId(id);
    setName(newTemplate.name);
  }

  function saveName() {
    if (!selected) return;
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === selected.id ? { ...template, name } : template,
      ),
    );
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragEnter(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    setDropIndex(index);
  }

  function handleDragEnd() {
    if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
      updateQuestions((questions) => {
        const next = [...questions];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(dropIndex, 0, moved);
        return next;
      });
    }
    setDragIndex(null);
    setDropIndex(null);
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6">
      <header className="mb-6 flex flex-col gap-3 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black leading-tight text-[#211B18] sm:text-4xl">
            Sabloane de intrebari
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#776D64]">
            Creeaza template-uri reutilizabile si aplica intrebari diferite pe
            fiecare masa.
          </p>
        </div>
        <button
          className="h-10 shrink-0 rounded-md bg-[#D5333C] px-4 text-sm font-semibold text-white transition hover:bg-[#B92731]"
          onClick={createTemplate}
          type="button"
        >
          Sablon nou
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="rounded-xl border border-[#E8D9BE] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#211B18]">
              Template-uri
            </h2>
          </div>

          <input
            className="mt-4 w-full rounded-lg border border-[#E8D9BE] bg-[#FFF9EF] px-4 py-2.5 text-sm text-[#211B18] placeholder:text-[#9A8C7A] focus:outline-none focus:ring-2 focus:ring-[#D5333C]"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cauta sablon..."
            type="text"
            value={search}
          />

          <div className="mt-4 space-y-2">
            {filtered.map((template) => {
              const active = template.id === selectedId;

              return (
                <button
                  className={classNames(
                    "w-full rounded-lg border px-4 py-3 text-left transition",
                    active
                      ? "border-[#D5333C] bg-[#FFF2CD]"
                      : "border-[#E8D9BE] bg-white hover:border-[#D8B56F]",
                  )}
                  key={template.id}
                  onClick={() => selectTemplate(template.id)}
                  type="button"
                >
                  <span className="font-semibold text-[#211B18]">
                    {template.name}
                  </span>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-[#9A8C7A]">
                    <span>{template.questions.length} intrebari</span>
                    <span>
                      {template.tablesCount > 0
                        ? `${template.tablesCount} mese`
                        : "0 mese"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg border border-[#E8D9BE] bg-[#FFF9EF] px-4 py-3">
            <p className="text-sm font-semibold text-[#211B18]">Fallback</p>
            <p className="mt-1 text-xs leading-5 text-[#776D64]">
              Daca masa nu are sablon propriu, foloseste sablonul default al
              salii sau al evenimentului.
            </p>
          </div>
        </div>

        {selected ? (
          <div className="rounded-xl border border-[#E8D9BE] bg-white p-5 sm:p-6">
            <h2 className="text-xl font-black text-[#211B18]">
              {selected.name}
            </h2>

            <div className="mt-4 max-w-sm">
              <label className="text-xs font-semibold text-[#9A8C7A]" htmlFor="template-name">
                Nume sablon
              </label>
              <input
                className="mt-1.5 w-full rounded-lg border border-[#E8D9BE] bg-[#FFF9EF] px-4 py-2.5 text-sm font-semibold text-[#211B18] focus:outline-none focus:ring-2 focus:ring-[#D5333C]"
                id="template-name"
                onBlur={saveName}
                onChange={(event) => setName(event.target.value)}
                type="text"
                value={name}
              />
            </div>

            <h3 className="mt-7 text-base font-black text-[#211B18]">
              Intrebarile
            </h3>

            <div className="mt-3 space-y-3">
              {selected.questions.map((question, index) => (
                <div
                  className={classNames(
                    "flex items-center gap-3 rounded-lg border bg-[#FFF9EF] px-4 py-3 transition",
                    dropIndex === index
                      ? "border-[#D5333C]"
                      : "border-[#E8D9BE]",
                    dragIndex === index && "opacity-50",
                  )}
                  draggable
                  key={question.id}
                  onDragEnd={handleDragEnd}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDragStart={() => handleDragStart(index)}
                >
                  <span
                    aria-hidden="true"
                    className="flex shrink-0 cursor-grab items-center text-[#C9BBA3] active:cursor-grabbing"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <circle cx="6" cy="5" r="1.4" />
                      <circle cx="6" cy="10" r="1.4" />
                      <circle cx="6" cy="15" r="1.4" />
                      <circle cx="14" cy="5" r="1.4" />
                      <circle cx="14" cy="10" r="1.4" />
                      <circle cx="14" cy="15" r="1.4" />
                    </svg>
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[#211B18]">
                        {question.title}
                      </p>
                      <span className="rounded-md bg-[#F5E6C4] px-2 py-0.5 text-xs font-semibold text-[#7B1D22]">
                        {typeLabels[question.type]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#776D64]">
                      {question.helper}
                    </p>
                  </div>

                  <span
                    className={classNames(
                      "shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold",
                      question.required
                        ? "bg-[#FBEAEA] text-[#B3261E]"
                        : "border border-[#E8D9BE] text-[#9A8C7A]",
                    )}
                  >
                    {question.required ? "required" : "optional"}
                  </span>
                </div>
              ))}

              {selected.questions.length === 0 && (
                <p className="rounded-lg border border-dashed border-[#E8D9BE] px-4 py-6 text-center text-sm text-[#9A8C7A]">
                  Acest sablon nu are inca nicio intrebare.
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                className="rounded-lg border border-[#D8B56F] px-4 py-2.5 text-sm font-semibold text-[#7B1D22] transition hover:bg-[#FFF2CD]"
                onClick={addQuestion}
                type="button"
              >
                + Adauga intrebare
              </button>
              <button
                className="rounded-lg bg-[#D5333C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B92731]"
                type="button"
              >
                Salveaza
              </button>
            </div>

            <p className="mt-4 text-xs text-[#9A8C7A]">
              Publicarea creeaza o versiune noua si pastreaza raspunsurile
              istorice pe versiunea anterioara.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-[#E8D9BE] bg-white p-10 text-sm text-[#776D64]">
            Selecteaza un sablon din stanga.
          </div>
        )}
      </div>
    </div>
  );
}
