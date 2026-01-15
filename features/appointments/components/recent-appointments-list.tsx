import type { RecentAppointment } from "../types/recent-appointments";
import { formatAppointmentDate, formatCurrency } from "@/shared/lib/formatters";

type RecentAppointmentsListProps = {
  items: RecentAppointment[];
};

export const RecentAppointmentsList = ({
  items,
}: RecentAppointmentsListProps) => {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const { date, time } = formatAppointmentDate(item.date_time);
        const serviceName = item.services[0]?.name ?? "Servico";
        return (
          <article
            key={item.id}
            className="rounded-[24px] bg-white px-4 py-4 shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-ink-900">
                  {serviceName}
                </h3>
                <p className="mt-1 text-sm text-ink-600">
                  {date} {time}
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  {item.professional_name}
                </p>
              </div>
              <span className="text-sm font-semibold text-ink-700">
                {formatCurrency(item.price_paid)}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
};
