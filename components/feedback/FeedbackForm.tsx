"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type QuestionType = "RATING" | "SINGLE_CHOICE" | "TEXT" | "NPS";

type FeedbackQuestion = {
  id: string;
  title: string;
  type: QuestionType;
  helper: string | null;
  options: string[] | null;
  required: boolean;
};

type Answer = { questionId: string; title: string; type: QuestionType; value: string | number };

const RATING_OPTIONS = [1, 2, 3, 4, 5];
const NPS_OPTIONS = Array.from({ length: 11 }, (_, index) => index);
const DEFAULT_SINGLE_CHOICE_OPTIONS = ["Excelenta", "Buna", "Slaba"];

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function FeedbackForm({
  qrToken,
  hallName,
  tableName,
  questions,
}: {
  qrToken: string;
  hallName: string;
  tableName: string;
  questions: FeedbackQuestion[];
}) {
  const [values, setValues] = useState<Record<string, string | number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scanSent = useRef(false);

  useEffect(() => {
    if (scanSent.current) return;
    scanSent.current = true;
    fetch(`/api/qr/${qrToken}/scan`, { method: "POST" }).catch(() => {});
  }, [qrToken]);

  function setValue(questionId: string, value: string | number) {
    setValues((prev) => ({ ...prev, [questionId]: value }));
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const missing = questions.find(
      (question) => question.required && values[question.id] === undefined,
    );
    if (missing) {
      setError(`Te rugam sa raspunzi la: "${missing.title}"`);
      return;
    }

    const answers: Answer[] = questions
      .filter((question) => values[question.id] !== undefined)
      .map((question) => ({
        questionId: question.id,
        title: question.title,
        type: question.type,
        value: values[question.id],
      }));

    const ratingQuestion = questions.find((question) => question.type === "RATING");
    const textQuestion = questions.find((question) => question.type === "TEXT");
    const rating = ratingQuestion ? values[ratingQuestion.id] : undefined;
    const comment = textQuestion ? values[textQuestion.id] : undefined;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/feedback/${qrToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          rating: typeof rating === "number" ? rating : null,
          comment: typeof comment === "string" ? comment : null,
        }),
      });
      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.error ?? "Nu am putut trimite feedback-ul");
      }
      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nu am putut trimite feedback-ul",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F1E6] px-5 py-10 text-[#211B18]">
      <div className="mx-auto w-full max-w-md">
        <header className="mb-8">
          <p className="text-xl font-bold">Paradis</p>
          <p className="mt-1 text-sm text-[#776D64]">
            {hallName} · {tableName}
          </p>
        </header>

        {isSubmitted ? (
          <SubmittedScreen />
        ) : questions.length === 0 ? (
          <div className="rounded-md border border-[#E5DED4] bg-white px-5 py-6 text-sm text-[#776D64]">
            Aceasta masa nu are inca intrebari configurate.
          </div>
        ) : (
          <form className="space-y-6" onSubmit={submitFeedback}>
            {questions.map((question) => (
              <QuestionField
                key={question.id}
                onChange={(value) => setValue(question.id, value)}
                question={question}
                value={values[question.id]}
              />
            ))}

            {error && (
              <p className="rounded-md border border-[#E8B4B4] bg-[#FBEAEA] px-4 py-3 text-sm text-[#B3261E]">
                {error}
              </p>
            )}

            <button
              className="h-12 w-full rounded-md bg-[#D5333C] text-sm font-semibold text-white transition hover:bg-[#B92731] disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Se trimite..." : "Trimite feedback"}
            </button>

            <p className="text-center text-xs text-[#9A8C7A]">
              Nu este necesar cont. Datele mesei sunt citite automat din QR.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: FeedbackQuestion;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold">
        {question.title}
        {question.required && <span className="text-[#D5333C]"> *</span>}
      </label>
      {question.helper && (
        <p className="mt-1 text-xs text-[#9A8C7A]">{question.helper}</p>
      )}

      {question.type === "RATING" && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {RATING_OPTIONS.map((option) => (
            <button
              className={classNames(
                "h-12 rounded-md border text-base font-semibold transition",
                value === option
                  ? "border-[#D5333C] bg-[#D5333C] text-white"
                  : "border-[#E5DED4] bg-white text-[#211B18] hover:border-[#D8B56F]",
              )}
              key={option}
              onClick={() => onChange(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {question.type === "NPS" && (
        <div className="mt-3 grid grid-cols-6 gap-1.5 sm:grid-cols-11">
          {NPS_OPTIONS.map((option) => (
            <button
              className={classNames(
                "h-10 rounded-md border text-sm font-semibold transition",
                value === option
                  ? "border-[#D5333C] bg-[#D5333C] text-white"
                  : "border-[#E5DED4] bg-white text-[#211B18] hover:border-[#D8B56F]",
              )}
              key={option}
              onClick={() => onChange(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {question.type === "SINGLE_CHOICE" && (
        <div className="mt-3 space-y-2">
          {(question.options && question.options.length > 0
            ? question.options
            : DEFAULT_SINGLE_CHOICE_OPTIONS
          ).map((option) => (
            <button
              className={classNames(
                "flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition",
                value === option
                  ? "border-[#D5333C] bg-[#FFF2CD]"
                  : "border-[#E5DED4] bg-white hover:border-[#D8B56F]",
              )}
              key={option}
              onClick={() => onChange(option)}
              type="button"
            >
              <span
                className={classNames(
                  "h-4 w-4 shrink-0 rounded-full border",
                  value === option
                    ? "border-[#D5333C] bg-[#D5333C]"
                    : "border-[#CBBFA9] bg-white",
                )}
              />
              {option}
            </button>
          ))}
        </div>
      )}

      {question.type === "TEXT" && (
        <textarea
          className="mt-3 min-h-[90px] w-full resize-none rounded-md border border-[#E5DED4] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#9A8C7A] focus:border-[#D5333C]"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Scrie aici..."
          value={typeof value === "string" ? value : ""}
        />
      )}
    </div>
  );
}

function SubmittedScreen() {
  return (
    <div className="rounded-md border border-[#E5DED4] bg-white px-5 py-6">
      <div className="flex items-center gap-3">
        <svg
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-[#21A366]"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <h1 className="text-base font-semibold">Multumim pentru feedback</h1>
      </div>
    </div>
  );
}
