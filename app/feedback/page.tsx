"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const scoreOptions = [1, 2, 3, 4, 5];
const recommendOptions = Array.from({ length: 11 }, (_, index) => index);

export default function FeedbackPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(5);
  const [service, setService] = useState("Excelenta");
  const [recommend, setRecommend] = useState(9);

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#E9EEF4] px-4 py-8 text-[#211B18] sm:py-14">
      <div className="mx-auto mb-3 flex w-full max-w-[390px] items-center justify-between text-[#0875D1]">
        <Link className="text-sm font-semibold hover:underline" href="/">
          Dashboard
        </Link>
        <span className="text-sm font-semibold">05 Public Feedback Form</span>
      </div>

      <section className="mx-auto min-h-[844px] w-full max-w-[390px] overflow-hidden border border-[#D8B56F] bg-[#F7F1E6] shadow-[0_22px_70px_rgba(70,49,24,0.14)]">
        <header className="h-[198px] bg-[linear-gradient(135deg,#D8333D_0%,#8C1820_78%)] px-10 pt-9 text-white">
          <p className="font-serif text-[52px] font-medium italic leading-none text-[#FFE069]">
            Paradis
          </p>
          <p className="mt-4 text-lg font-black">feedback eveniment</p>
        </header>

        {isSubmitted ? (
          <SubmittedScreen onReset={() => setIsSubmitted(false)} />
        ) : (
          <form className="space-y-5 px-6 py-6" onSubmit={submitFeedback}>
            <FormCard>
              <h1 className="text-[24px] font-black leading-[1.2] text-[#6F665E]">
                Cat de multumit esti de experienta de azi?
              </h1>
              <div className="mt-3 grid grid-cols-5 gap-3">
                {scoreOptions.map((option) => (
                  <button
                    className={buttonState(score === option)}
                    key={option}
                    onClick={() => setScore(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </FormCard>

            <FormCard>
              <h2 className="text-[22px] font-black leading-tight text-[#6F665E]">
                Cum a fost servirea personalului?
              </h2>
              <div className="mt-5 space-y-2">
                {["Excelenta", "Buna"].map((option) => (
                  <button
                    className={classNames(
                      "flex h-[62px] w-full items-center gap-4 rounded-lg border px-5 text-left text-lg transition focus:outline-none focus:ring-2 focus:ring-[#D5333C] focus:ring-offset-2",
                      service === option
                        ? "border-[#D5333C] bg-[#FFF2CD] text-[#6F665E]"
                        : "border-[#E5DED4] bg-white text-[#6F665E]",
                    )}
                    key={option}
                    onClick={() => setService(option)}
                    type="button"
                  >
                    <span
                      className={classNames(
                        "h-6 w-6 rounded-full border",
                        service === option
                          ? "border-[#D5333C] bg-[#D5333C]"
                          : "border-[#E0CFB6] bg-white",
                      )}
                    />
                    <span className="font-medium">{option}</span>
                  </button>
                ))}
              </div>
            </FormCard>

            <FormCard>
              <h2 className="text-[22px] font-black leading-tight text-[#6F665E]">
                Ce putem imbunatati?
              </h2>
              <textarea
                className="mt-5 min-h-[86px] w-full resize-none rounded-lg border border-[#DED8D0] bg-[#F3EDE2] px-5 py-4 text-lg text-[#6F665E] outline-none transition placeholder:text-[#8A7C70] focus:border-[#D5333C] focus:ring-2 focus:ring-[#D5333C]/20"
                placeholder="Scrie aici optional..."
              />
            </FormCard>

            <FormCard>
              <h2 className="text-[22px] font-black leading-tight text-[#6F665E]">
                Ai recomanda Paradis unui prieten?
              </h2>
              <div className="mt-6 grid grid-cols-11 gap-1">
                {recommendOptions.map((option) => (
                  <button
                    className={classNames(
                      "flex h-12 min-w-0 items-center justify-center rounded-lg text-base font-black transition focus:outline-none focus:ring-2 focus:ring-[#D5333C] focus:ring-offset-2",
                      recommend === option
                        ? "bg-[#D5333C] text-white"
                        : "bg-[#F4EDE2] text-[#776D64]",
                    )}
                    key={option}
                    onClick={() => setRecommend(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </FormCard>

            <button
              className="h-[70px] w-full rounded-lg bg-[#D5333C] text-xl font-black text-white shadow-[0_12px_26px_rgba(213,51,60,0.18)] transition hover:bg-[#B92731] focus:outline-none focus:ring-2 focus:ring-[#D5333C] focus:ring-offset-2"
              type="submit"
            >
              Trimite feedback
            </button>

            <p className="px-3 pt-10 text-center text-base leading-6 text-[#776D64]">
              Nu este necesar cont. Datele mesei sunt citite automat din QR.
            </p>
          </form>
        )}
      </section>
    </main>
  );
}

function SubmittedScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex min-h-[646px] flex-col items-center justify-center px-8 py-10 text-center">
      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#21A366] shadow-[0_18px_36px_rgba(33,163,102,0.26)]">
        <span className="text-[78px] font-black leading-none text-white" aria-hidden>
          ✓
        </span>
      </div>

      <h1 className="mt-9 text-[28px] font-black leading-[1.18] text-[#211B18]">
        Multumesc, Feedbackul dumneavoastra conteaza pentru noi
      </h1>
      <p className="mt-4 text-base leading-6 text-[#776D64]">
        Raspunsul a fost trimis pentru Masa 12.
      </p>

      <button
        className="mt-10 h-12 rounded-lg border border-[#D8B56F] px-6 text-sm font-black text-[#7B1D22] transition hover:bg-[#FFF2CD] focus:outline-none focus:ring-2 focus:ring-[#21A366] focus:ring-offset-2"
        onClick={onReset}
        type="button"
      >
        Trimite alt feedback
      </button>
    </div>
  );
}

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#E5D0AA] bg-white px-5 py-6 shadow-[0_10px_22px_rgba(91,59,21,0.08)]">
      {children}
    </section>
  );
}

function buttonState(isSelected: boolean) {
  return classNames(
    "flex h-16 min-w-0 items-center justify-center rounded-lg border text-2xl font-black transition focus:outline-none focus:ring-2 focus:ring-[#D5333C] focus:ring-offset-2",
    isSelected
      ? "border-[#D5333C] bg-[#D5333C] text-white"
      : "border-[#E5DED4] bg-[#F7F1E6] text-[#211B18] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]",
  );
}

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}
