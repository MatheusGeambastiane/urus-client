import { notFound } from "next/navigation";
import { AvailabilityScreen } from "@/features/appointments/components/availability-screen";
import { getServices } from "@/features/services/services/service-service";

type SchedulePageProps = {
  params: Promise<{ serviceId: string }>;
};

const findServiceById = async (serviceId: number) => {
  const services = await getServices();
  return services.find((service) => service.id === serviceId) ?? null;
};

export default async function SchedulePage({ params }: SchedulePageProps) {
  const { serviceId } = await params;
  const parsedId = Number(serviceId);

  if (Number.isNaN(parsedId)) {
    notFound();
  }

  const service = await findServiceById(parsedId);

  if (!service) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-4 pb-28 pt-8">
      <AvailabilityScreen service={service} />
    </main>
  );
}
