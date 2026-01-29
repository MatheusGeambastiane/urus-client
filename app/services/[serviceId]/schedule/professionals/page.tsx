import { notFound } from "next/navigation";
import { getProfessionals } from "@/features/professionals/services/professional-service";
import { ProfessionalsScreen } from "@/features/professionals/components/professionals-screen";

type ProfessionalsPageProps = {
  params: Promise<{ serviceId: string }>;
  searchParams?: Promise<{ continue_scheduling?: string }>;
};

export default async function ProfessionalsPage({
  params,
  searchParams,
}: ProfessionalsPageProps) {
  const { serviceId } = await params;
  const resolvedSearchParams = await searchParams;
  const parsedId = Number(serviceId);

  if (Number.isNaN(parsedId)) {
    notFound();
  }

  const professionals = await getProfessionals({ serviceId: parsedId });
  const continueScheduling =
    resolvedSearchParams?.continue_scheduling === "true";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-4 pb-28 pt-8">
      <ProfessionalsScreen
        professionals={professionals}
        continueScheduling={continueScheduling}
      />
    </main>
  );
}
