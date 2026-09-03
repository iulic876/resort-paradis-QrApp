"use client";

import { FormEvent, useState } from "react";

const scoreOptions = [1, 2, 3, 4, 5];

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function FeedbackPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#F7F1E6] px-5 py-10 text-[#211B18]">
      <div className="mx-auto w-full max-w-md">
        <header className="mb-8">
          <p className="text-xl font-bold">Paradis</p>
          <p className="mt-1 text-sm text-[#776D64]">Feedback eveniment</p>
        </header>

        {isSubmitted ? (
          <SubmittedScreen />
        ) : (
          <form className="space-y-6" onSubmit={submitFeedback}>
            <div>
              <label className="text-sm font-semibold">
                Cat de multumit esti de experienta de azi?
              </label>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {scoreOptions.map((option) => (
                  <button
                    className={classNames(
                      "h-12 rounded-md border text-base font-semibold transition",
                      score === option
                        ? "border-[#D5333C] bg-[#D5333C] text-white"
                        : "border-[#E5DED4] bg-white text-[#211B18] hover:border-[#D8B56F]",
                    )}
                    key={option}
                    onClick={() => setScore(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">
                Cum a fost servirea personalului?
              </label>
              <div className="mt-3 space-y-2">
                {["Excelenta", "Buna", "Slaba"].map((option) => (
                  <button
                    className={classNames(
                      "flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition",
                      service === option
                        ? "border-[#D5333C] bg-[#FFF2CD]"
                        : "border-[#E5DED4] bg-white hover:border-[#D8B56F]",
                    )}
                    key={option}
                    onClick={() => setService(option)}
                    type="button"
                  >
                    <span
                      className={classNames(
                        "h-4 w-4 shrink-0 rounded-full border",
                        service === option
                          ? "border-[#D5333C] bg-[#D5333C]"
                          : "border-[#CBBFA9] bg-white",
                      )}
                    />
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold" htmlFor="comment">
                Ce putem imbunatati?
              </label>
              <textarea
                className="mt-3 min-h-[90px] w-full resize-none rounded-md border border-[#E5DED4] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#9A8C7A] focus:border-[#D5333C]"
                id="comment"
                onChange={(event) => setComment(event.target.value)}
                placeholder="Scrie aici optional..."
                value={comment}
              />
            </div>

            <button
              className="h-12 w-full rounded-md bg-[#D5333C] text-sm font-semibold text-white transition hover:bg-[#B92731]"
              type="submit"
            >
              Trimite feedback
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
