import Link from "next/link";
import { HeroCarousel } from "@/features/home/components/hero-carousel";
import { CategoryCarousel } from "@/features/services/components/category-carousel";
import { ServicesList } from "@/features/services/components/services-list";
import { getServiceCategories } from "@/features/services/services/service-category-service";
import { getServices } from "@/features/services/services/service-service";
import { groupServicesByCategory } from "@/features/services/utils/group-services";
import { getAuthSession } from "@/shared/auth/server";
import { getNextAppointment } from "@/features/appointments/services/next-appointment-service";
import { NextAppointmentCard } from "@/features/appointments/components/next-appointment-card";
import { getUserProfile } from "@/features/profile/services/profile-service";

export default async function Home() {
  const sessionPromise = getAuthSession();
  const categoriesPromise = getServiceCategories();
  const servicesPromise = getServices();
  const session = await sessionPromise;
  const firstName = (session?.user as { firstName?: string | null })?.firstName ?? null;
  const userName = firstName ?? session?.user?.name?.split(" ")[0] ?? null;
  const accessToken = (session?.user as { accessToken?: string | null })
    ?.accessToken;
  const authenticatedDataPromise = accessToken
    ? Promise.all([
        getNextAppointment({ accessToken }).catch(() => null),
        getUserProfile({ accessToken }).catch(() => null),
      ])
    : Promise.resolve([null, null] as const);
  const [categories, services, [nextAppointment, profile]] = await Promise.all([
    categoriesPromise,
    servicesPromise,
    authenticatedDataPromise,
  ]);
  const groupedServices = groupServicesByCategory(services);
  const shouldCompletePhone = Boolean(
    accessToken && profile && !profile.phone?.trim(),
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-10 px-4 pb-28 pt-8">
      <header className="space-y-2">
        {/* <p className="text-xs uppercase tracking-[0.4em] text-ink-400">
          Servicos da barbearia
        </p> */}
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold text-ink-900">
            {userName ? `Ola, ${userName}` : "Agende seu horario com estilo"}
          </h1>
          <p className="text-sm text-ink-600">
            {userName
              ? "Seus servicos preferidos estão separados abaixo."
              : "Entre para ver seu historico e favoritos."}
          </p>
        </div>
      </header>

      {shouldCompletePhone ? (
        <aside
          aria-labelledby="complete-phone-title"
          className="relative isolate overflow-hidden rounded-[28px] bg-amber-100 px-5 py-5 shadow-soft ring-1 ring-amber-900/10"
        >
          <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-amber-300/45 blur-2xl" />
          <div className="absolute -bottom-14 left-12 h-28 w-28 rounded-full bg-white/70 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div
              aria-hidden="true"
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-ink-900 text-amber-200 shadow-lg shadow-amber-900/15"
            >
              <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none">
                <path
                  d="M22 9h20a5 5 0 0 1 5 5v36a5 5 0 0 1-5 5H22a5 5 0 0 1-5-5V14a5 5 0 0 1 5-5Z"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path d="M28 15h8M29 49h6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <circle cx="46" cy="18" r="9" fill="#F59E0B" stroke="#18181B" strokeWidth="3" />
                <path d="M46 13v6" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
                <circle cx="46" cy="23" r="1.5" fill="#18181B" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-800">
                Perfil incompleto
              </p>
              <h2 id="complete-phone-title" className="mt-1 font-display text-lg font-semibold leading-tight text-ink-900">
                Adicione seu telefone
              </h2>
              <p className="mt-1 text-xs leading-5 text-ink-600">
                Complete seus dados para facilitar o contato sobre seus agendamentos.
              </p>
              <Link
                href="/profile"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-100"
              >
                Completar perfil
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </aside>
      ) : null}

      <HeroCarousel />

      {nextAppointment ? (
        <NextAppointmentCard
          appointment={nextAppointment}
          services={services}
          accessToken={accessToken ?? null}
        />
      ) : null}

      <CategoryCarousel categories={categories} />

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
            Selecao atual
          </p>
          <h2 className="font-display text-2xl font-semibold text-ink-900">
            Servicos disponiveis
          </h2>
        </div>
        <ServicesList groups={groupedServices} />
      </section>
    </main>
  );
}
