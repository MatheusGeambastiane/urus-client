import Image from "next/image";
import { CategoryCarousel } from "@/features/services/components/category-carousel";
import { ServicesList } from "@/features/services/components/services-list";
import { getServiceCategories } from "@/features/services/services/service-category-service";
import { getServices } from "@/features/services/services/service-service";
import { groupServicesByCategory } from "@/features/services/utils/group-services";
import { getAuthSession } from "@/shared/auth/server";
import { getNextAppointment } from "@/features/appointments/services/next-appointment-service";
import { NextAppointmentCard } from "@/features/appointments/components/next-appointment-card";

export default async function Home() {
  const [session, categories, services] = await Promise.all([
    getAuthSession(),
    getServiceCategories(),
    getServices(),
  ]);

  const groupedServices = groupServicesByCategory(services);
  const userName = session?.user?.name?.split(" ")[0];
  const accessToken = (session?.user as { accessToken?: string | null })
    ?.accessToken;
  const nextAppointment = accessToken
    ? await getNextAppointment({ accessToken }).catch(() => null)
    : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-10 px-4 pb-28 pt-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-ink-400">
          Servicos da barbearia
        </p>
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold text-ink-900">
            {userName ? `Ola, ${userName}` : "Agende seu horario com estilo"}
          </h1>
          <p className="text-sm text-ink-600">
            {userName
              ? "Seus servicos preferidos estao separados abaixo."
              : "Entre para ver seu historico e favoritos."}
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <div className="relative overflow-hidden rounded-[28px] bg-ink-900 shadow-soft">
          <Image
            src="/barba.png"
            alt="Barbearia em destaque"
            width={640}
            height={420}
            className="h-[320px] w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-5 left-5 space-y-1 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Experiencia premium
            </p>
            <h2 className="font-display text-2xl font-semibold">
              A barba perfeita
            </h2>
          </div>
        </div>
      </section>

      {nextAppointment ? (
        <NextAppointmentCard appointment={nextAppointment} />
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
