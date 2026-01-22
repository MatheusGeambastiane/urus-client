import { redirect } from "next/navigation";
import { getAuthSession } from "@/shared/auth/server";
import { getRecentAppointments } from "@/features/appointments/services/recent-appointments-service";
import { RecentAppointmentsList } from "@/features/appointments/components/recent-appointments-list";

const parseQueryNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
};

const extractPageParam = (url: string | null) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const page = parsed.searchParams.get("page");
    return page ?? null;
  } catch {
    return null;
  }
};

type AppointmentsPageProps = {
  searchParams?: { page?: string; page_size?: string };
};

export default async function AppointmentsPage({
  searchParams,
}: AppointmentsPageProps) {
  const session = await getAuthSession();
  const accessToken = (session?.user as { accessToken?: string | null })
    ?.accessToken;
  const refreshToken = (session?.user as { refreshToken?: string | null })
    ?.refreshToken;

  if (!accessToken) {
    redirect("/auth?tab=login&redirect=/appointments");
  }

  const page = parseQueryNumber(searchParams?.page, 1);
  const pageSize = parseQueryNumber(searchParams?.page_size, 2);
  const response = await getRecentAppointments({
    accessToken,
    refreshToken,
    page,
    pageSize,
  });

  const nextPage = extractPageParam(response.next);
  const previousPage = extractPageParam(response.previous);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-4 pb-28 pt-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
          Historico
        </p>
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Meus agendamentos
        </h1>
        <p className="text-sm text-ink-600">
          Confira suas ultimas reservas.
        </p>
      </header>

      <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-3 text-sm text-ink-600 shadow-soft">
        <span>Total: {response.count}</span>
        <div className="flex items-center gap-2">
          <span>Itens por pagina</span>
          <div className="flex items-center gap-1">
            {[2, 4, 6].map((size) => (
              <a
                key={size}
                href={`?page=1&page_size=${size}`}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  pageSize === size
                    ? "bg-ink-900 text-white"
                    : "bg-ink-100 text-ink-500"
                }`}
              >
                {size}
              </a>
            ))}
          </div>
        </div>
      </div>

      {response.results.length === 0 ? (
        <div className="rounded-3xl bg-white px-4 py-5 text-sm text-ink-500 shadow-soft">
          Nenhum agendamento encontrado.
        </div>
      ) : (
        <RecentAppointmentsList items={response.results} />
      )}

      <div className="flex items-center justify-between">
        <a
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            previousPage ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-400"
          }`}
          href={`?page=${previousPage ?? page}&page_size=${pageSize}`}
          aria-disabled={!previousPage}
        >
          Anterior
        </a>
        <a
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            nextPage ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-400"
          }`}
          href={`?page=${nextPage ?? page}&page_size=${pageSize}`}
          aria-disabled={!nextPage}
        >
          Proximo
        </a>
      </div>
    </main>
  );
}
