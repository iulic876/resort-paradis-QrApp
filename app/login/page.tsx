import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_SESSION_COOKIE,
  isAdminPasswordConfigured,
  isAdminSessionValid,
  safeRedirectPath,
} from "@/lib/auth";

export const metadata: Metadata = {
  title: "Login | QR Feedback",
};

const errorMessages: Record<string, string> = {
  invalid: "Parola nu este corecta.",
  config: "ADMIN_PASSWORD nu este setat in .env.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeRedirectPath(params.next);
  const cookieStore = await cookies();
  const isAuthenticated = await isAdminSessionValid(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (isAuthenticated) {
    redirect(nextPath);
  }

  const isConfigured = isAdminPasswordConfigured();
  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F1E6] px-4 py-10 text-[#211B18]">
      <section className="w-full max-w-[390px] rounded-lg border border-[#D8B56F] bg-white p-6 shadow-[0_24px_70px_rgba(70,49,24,0.14)]">
        <div className="rounded-lg bg-[linear-gradient(135deg,#D8333D_0%,#8C1820_78%)] px-6 py-6 text-white">
          <p className="text-2xl font-black">Paradis</p>
          <p className="mt-1 text-sm font-semibold text-white/80">
            Feedback admin
          </p>
        </div>

        <form action="/api/auth/login" className="mt-6 space-y-4" method="post">
          <input name="next" type="hidden" value={nextPath} />

          <div>
            <label
              className="text-sm font-semibold text-[#6C6259]"
              htmlFor="password"
            >
              Parola admin
            </label>
            <input
              autoComplete="current-password"
              autoFocus
              className="mt-2 h-12 w-full rounded-lg border border-[#E8D9BE] bg-[#FFF9EF] px-4 text-base font-semibold text-[#211B18] outline-none transition placeholder:text-[#9A8C7A] focus:border-[#D5333C] focus:ring-2 focus:ring-[#D5333C]/20"
              disabled={!isConfigured}
              id="password"
              name="password"
              placeholder="Introdu parola"
              required
              type="password"
            />
          </div>

          {errorMessage && (
            <p className="rounded-lg border border-[#E8B4B4] bg-[#FBEAEA] px-3 py-2 text-sm font-semibold text-[#B3261E]">
              {errorMessage}
            </p>
          )}

          <button
            className="h-12 w-full rounded-lg bg-[#D5333C] text-base font-black text-white transition hover:bg-[#B92731] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isConfigured}
            type="submit"
          >
            Intra in admin
          </button>
        </form>
      </section>
    </main>
  );
}
