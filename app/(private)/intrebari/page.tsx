"use client";

import { useEffect, useMemo, useState } from "react";

type QuestionType = "RATING" | "SINGLE_CHOICE" | "TEXT" | "NPS";
type TemplateStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

const QUESTION_TYPES: QuestionType[] = ["RATING", "SINGLE_CHOICE", "TEXT", "NPS"];

type TemplateQuestion = {
  id: string;
  templateId: string;
  title: string;
  type: QuestionType;
  helper: string | null;
  options: string[] | null;
  required: boolean;
  sortOrder: number;
};

type QuestionTemplate = {
  id: string;
  name: string;
  status: TemplateStatus;
  version: number;
  tablesCount: number;
  questions: TemplateQuestion[];
};

type Hall = {
  id: string;
  name: string;
  defaultTemplateId: string | null;
};

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const typeLabels: Record<QuestionType, string> = {
  RATING: "rating",
  SINGLE_CHOICE: "single",
  TEXT: "text",
  NPS: "nps",
};

async function parseJson(response: Response) {
  return response.json().catch(() => null);
}

export default function QuestionTemplatesPage() {
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [assigningHallId, setAssigningHallId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [templatesResponse, hallsResponse] = await Promise.all([
          fetch("/api/question-templates"),
          fetch("/api/halls"),
        ]);
        const templatesJson = await parseJson(templatesResponse);
        if (!templatesResponse.ok) {
          throw new Error(templatesJson?.error ?? "Eroare la incarcare");
        }
        if (cancelled) return;
        const data: QuestionTemplate[] = templatesJson.data;
        setTemplates(data);
        setSelectedId((current) => current ?? data[0]?.id ?? null);
        setName(data[0]?.name ?? "");

        const hallsJson = await parseJson(hallsResponse);
        if (hallsResponse.ok && !cancelled) {
          setHalls(hallsJson.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Eroare la incarcare");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

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

  function patchTemplate(id: string, patch: Partial<QuestionTemplate>) {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === id ? { ...template, ...patch } : template,
      ),
    );
  }

  async function createTemplate() {
    setSaving(true);
    try {
      const response = await fetch("/api/question-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Sablon nou" }),
      });
      const json = await parseJson(response);
      if (!response.ok) throw new Error(json?.error ?? "Nu am putut crea sablonul");
      const created: QuestionTemplate = {
        ...json.data,
        tablesCount: 0,
        questions: json.data.questions ?? [],
      };
      setTemplates((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setName(created.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut crea sablonul");
    } finally {
      setSaving(false);
    }
  }

  async function saveName() {
    if (!selected) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === selected.name) {
      setName(selected.name);
      return;
    }
    const previousName = selected.name;
    patchTemplate(selected.id, { name: trimmed });
    try {
      const response = await fetch(`/api/question-templates/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const json = await parseJson(response);
      if (!response.ok) throw new Error(json?.error ?? "Nu am putut salva numele");
    } catch (err) {
      patchTemplate(selected.id, { name: previousName });
      setName(previousName);
      setError(err instanceof Error ? err.message : "Nu am putut salva numele");
    }
  }

  async function addQuestion() {
    if (!selected) return;
    try {
      const response = await fetch(
        `/api/question-templates/${selected.id}/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Intrebare noua",
            type: "TEXT",
            helper: "raspuns liber optional",
            required: false,
          }),
        },
      );
      const json = await parseJson(response);
      if (!response.ok) throw new Error(json?.error ?? "Nu am putut adauga intrebarea");
      patchTemplate(selected.id, {
        questions: [...selected.questions, json.data],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut adauga intrebarea");
    }
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragEnter(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    setDropIndex(index);
  }

  async function handleDragEnd() {
    const from = dragIndex;
    const to = dropIndex;
    setDragIndex(null);
    setDropIndex(null);
    if (!selected || from === null || to === null || from === to) return;

    const reordered = [...selected.questions];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const previous = selected.questions;
    patchTemplate(selected.id, { questions: reordered });

    try {
      const response = await fetch(
        `/api/question-templates/${selected.id}/questions/reorder`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionIds: reordered.map((question) => question.id),
          }),
        },
      );
      const json = await parseJson(response);
      if (!response.ok) throw new Error(json?.error ?? "Nu am putut reordona intrebarile");
      patchTemplate(selected.id, { questions: json.data });
    } catch (err) {
      patchTemplate(selected.id, { questions: previous });
      setError(err instanceof Error ? err.message : "Nu am putut reordona intrebarile");
    }
  }

  async function updateQuestion(
    questionId: string,
    patch: Partial<
      Pick<TemplateQuestion, "title" | "type" | "helper" | "options" | "required">
    >,
  ) {
    if (!selected) return;
    const previous = selected.questions;
    patchTemplate(selected.id, {
      questions: selected.questions.map((question) =>
        question.id === questionId ? { ...question, ...patch } : question,
      ),
    });

    try {
      const response = await fetch(
        `/api/question-templates/${selected.id}/questions/${questionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        },
      );
      const json = await parseJson(response);
      if (!response.ok) throw new Error(json?.error ?? "Nu am putut salva intrebarea");
      patchTemplate(selected.id, {
        questions: selected.questions.map((question) =>
          question.id === questionId ? json.data : question,
        ),
      });
    } catch (err) {
      patchTemplate(selected.id, { questions: previous });
      setError(err instanceof Error ? err.message : "Nu am putut salva intrebarea");
    }
  }

  async function deleteQuestion(questionId: string) {
    if (!selected) return;
    if (!confirm("Stergi aceasta intrebare din sablon?")) return;

    const previous = selected.questions;
    patchTemplate(selected.id, {
      questions: selected.questions.filter((question) => question.id !== questionId),
    });

    try {
      const response = await fetch(
        `/api/question-templates/${selected.id}/questions/${questionId}`,
        { method: "DELETE" },
      );
      if (!response.ok && response.status !== 204) {
        const json = await parseJson(response);
        throw new Error(json?.error ?? "Nu am putut sterge intrebarea");
      }
    } catch (err) {
      patchTemplate(selected.id, { questions: previous });
      setError(err instanceof Error ? err.message : "Nu am putut sterge intrebarea");
    }
  }

  async function assignHallDefault(hallId: string, templateId: string | null) {
    setAssigningHallId(hallId);
    setError(null);
    const previousHalls = halls;
    setHalls((prev) =>
      prev.map((hall) =>
        hall.id === hallId ? { ...hall, defaultTemplateId: templateId } : hall,
      ),
    );

    try {
      const response = await fetch(`/api/halls/${hallId}/question-template`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const json = await parseJson(response);
      if (!response.ok) {
        throw new Error(json?.error ?? "Nu am putut salva sablonul default");
      }
    } catch (err) {
      setHalls(previousHalls);
      setError(
        err instanceof Error ? err.message : "Nu am putut salva sablonul default",
      );
    } finally {
      setAssigningHallId(null);
    }
  }

  async function deleteTemplate() {
    if (!selected) return;
    if (!confirm(`Stergi sablonul "${selected.name}"? Aceasta actiune nu poate fi anulata.`)) {
      return;
    }

    const previousTemplates = templates;
    const remaining = templates.filter((template) => template.id !== selected.id);
    setTemplates(remaining);
    setSelectedId(remaining[0]?.id ?? null);
    setName(remaining[0]?.name ?? "");

    try {
      const response = await fetch(`/api/question-templates/${selected.id}`, {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        const json = await parseJson(response);
        throw new Error(json?.error ?? "Nu am putut sterge sablonul");
      }
    } catch (err) {
      setTemplates(previousTemplates);
      setSelectedId(selected.id);
      setName(selected.name);
      setError(err instanceof Error ? err.message : "Nu am putut sterge sablonul");
    }
  }

  async function publishTemplate() {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/question-templates/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      const json = await parseJson(response);
      if (!response.ok) throw new Error(json?.error ?? "Nu am putut publica sablonul");
      patchTemplate(selected.id, {
        status: json.data.status,
        version: json.data.version,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nu am putut publica sablonul");
    } finally {
      setSaving(false);
    }
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
          className="h-10 shrink-0 rounded-md bg-[#D5333C] px-4 text-sm font-semibold text-white transition hover:bg-[#B92731] disabled:opacity-60"
          disabled={saving}
          onClick={createTemplate}
          type="button"
        >
          Sablon nou
        </button>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-[#E8B4B4] bg-[#FBEAEA] px-4 py-3 text-sm text-[#B3261E]">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[#776D64]">Se incarca...</p>
      ) : (
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

              {filtered.length === 0 && (
                <p className="px-1 py-4 text-center text-sm text-[#9A8C7A]">
                  Niciun sablon gasit.
                </p>
              )}
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-black text-[#211B18]">
                  {selected.name}
                </h2>
                <button
                  className="rounded-lg border border-[#E8B4B4] px-3 py-1.5 text-xs font-semibold text-[#B3261E] transition hover:bg-[#FBEAEA]"
                  onClick={deleteTemplate}
                  type="button"
                >
                  Sterge sablon
                </button>
              </div>

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
                      "rounded-lg border bg-[#FFF9EF] px-4 py-3 transition",
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
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 flex shrink-0 cursor-grab items-center text-[#C9BBA3] active:cursor-grabbing"
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

                      <div className="min-w-0 flex-1 space-y-2">
                        <input
                          className="w-full rounded-md border border-transparent bg-transparent px-1 py-1 text-sm font-semibold text-[#211B18] transition focus:border-[#E8D9BE] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5333C]"
                          defaultValue={question.title}
                          key={`${question.id}-title`}
                          onBlur={(event) => {
                            const value = event.target.value.trim();
                            if (value && value !== question.title) {
                              updateQuestion(question.id, { title: value });
                            } else {
                              event.target.value = question.title;
                            }
                          }}
                          type="text"
                        />
                        <input
                          className="w-full rounded-md border border-transparent bg-transparent px-1 py-1 text-sm text-[#776D64] transition focus:border-[#E8D9BE] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D5333C]"
                          defaultValue={question.helper ?? ""}
                          key={`${question.id}-helper`}
                          onBlur={(event) => {
                            const value = event.target.value.trim();
                            if (value !== (question.helper ?? "")) {
                              updateQuestion(question.id, { helper: value || null });
                            }
                          }}
                          placeholder="Text ajutator (optional)"
                          type="text"
                        />
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <select
                            className="rounded-md border border-[#E8D9BE] bg-white px-2 py-1 text-xs font-semibold text-[#7B1D22] focus:outline-none focus:ring-2 focus:ring-[#D5333C]"
                            onChange={(event) =>
                              updateQuestion(question.id, {
                                type: event.target.value as QuestionType,
                              })
                            }
                            value={question.type}
                          >
                            {QUESTION_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {typeLabels[type]}
                              </option>
                            ))}
                          </select>

                          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#776D64]">
                            <input
                              checked={question.required}
                              className="h-3.5 w-3.5 accent-[#D5333C]"
                              onChange={(event) =>
                                updateQuestion(question.id, {
                                  required: event.target.checked,
                                })
                              }
                              type="checkbox"
                            />
                            obligatorie
                          </label>

                          {/*<button*/}
                          {/*  className="ml-auto text-xs font-semibold text-[#B3261E] transition hover:underline"*/}
                          {/*  onClick={() => deleteQuestion(question.id)}*/}
                          {/*  type="button"*/}
                          {/*>*/}
                          {/*  Sterge*/}
                          {/*</button>*/}
                        </div>

                        {question.type === "SINGLE_CHOICE" && (
                          <div>
                            <label className="text-[11px] font-semibold text-[#9A8C7A]">
                              Optiuni (separate prin virgula)
                            </label>
                            <input
                              className="mt-1 w-full rounded-md border border-[#E8D9BE] bg-white px-2 py-1.5 text-sm text-[#211B18] focus:outline-none focus:ring-2 focus:ring-[#D5333C]"
                              defaultValue={(question.options ?? []).join(", ")}
                              key={`${question.id}-options`}
                              onBlur={(event) => {
                                const options = event.target.value
                                  .split(",")
                                  .map((option) => option.trim())
                                  .filter(Boolean);
                                const previous = (question.options ?? []).join(", ");
                                if (event.target.value.trim() === previous) return;
                                updateQuestion(question.id, {
                                  options: options.length > 0 ? options : null,
                                });
                              }}
                              placeholder="Ex: Excelenta, Buna, Slaba"
                              type="text"
                            />
                          </div>
                        )}
                      </div>
                    </div>
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
                  className="rounded-lg bg-[#D5333C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#B92731] disabled:opacity-60"
                  disabled={saving || selected.status === "ACTIVE"}
                  onClick={publishTemplate}
                  type="button"
                >
                  {selected.status === "ACTIVE" ? "Publicat" : "Publica"}
                </button>
              </div>

              <p className="mt-4 text-xs text-[#9A8C7A]">
                Publicarea creeaza o versiune noua si pastreaza raspunsurile
                istorice pe versiunea anterioara.
              </p>

              {halls.length > 0 && (
                <div className="mt-7 border-t border-[#E6D6B9] pt-5">
                  <h3 className="text-base font-black text-[#211B18]">
                    Sablon default pentru sali
                  </h3>
                  <p className="mt-1 text-xs text-[#9A8C7A]">
                    Salile fara sablon propriu pe masa vor folosi acest sablon.
                  </p>
                  <div className="mt-3 space-y-2">
                    {halls.map((hall) => {
                      const isDefault = hall.defaultTemplateId === selected.id;
                      return (
                        <label
                          className="flex items-center justify-between gap-3 rounded-lg border border-[#E8D9BE] bg-[#FFF9EF] px-3 py-2 text-sm"
                          key={hall.id}
                        >
                          <span className="text-[#211B18]">{hall.name}</span>
                          <input
                            checked={isDefault}
                            className="h-4 w-4 accent-[#D5333C] disabled:opacity-60"
                            disabled={assigningHallId === hall.id}
                            onChange={(event) =>
                              assignHallDefault(
                                hall.id,
                                event.target.checked ? selected.id : null,
                              )
                            }
                            type="checkbox"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-[#E8D9BE] bg-white p-10 text-sm text-[#776D64]">
              Selecteaza un sablon din stanga.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
