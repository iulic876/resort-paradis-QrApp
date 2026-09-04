export function AdminDatabaseUnavailable() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F1E6] px-4 py-10 text-[#211B18]">
      <section className="w-full max-w-[460px] rounded-lg border border-[#D8B56F] bg-white p-6 shadow-[0_24px_70px_rgba(70,49,24,0.14)]">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8D7560]">
          Admin indisponibil
        </p>
        <h1 className="mt-3 text-2xl font-black leading-tight">
          Baza de date nu raspunde.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6C6259]">
          Aplicatia este autentificata, dar nu se poate conecta la Postgres.
          Verifica daca baza de date din{" "}
          <code className="rounded bg-[#F7F1E6] px-1 font-semibold text-[#7B1D22]">
            DATABASE_URL
          </code>{" "}
          ruleaza si daca migratiile Prisma sunt aplicate.
        </p>
      </section>
    </main>
  );
}
