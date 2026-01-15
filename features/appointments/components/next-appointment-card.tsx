import type { NextAppointment } from "../types/next-appointment";
import { formatAppointmentDate, formatCurrency } from "@/shared/lib/formatters";

type NextAppointmentCardProps = {
  appointment: NextAppointment;
};

export const NextAppointmentCard = ({
  appointment,
}: NextAppointmentCardProps) => {
  const { date, time } = formatAppointmentDate(appointment.date_time);

  return (
    <section className="rounded-[28px] bg-white px-5 py-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
            Proximo agendamento
          </p>
          <h3 className="mt-2 text-lg font-semibold text-ink-900">
            {appointment.service_name}
          </h3>
        </div>
        <span className="text-sm font-semibold text-ink-700">
          {formatCurrency(appointment.price_paid)}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-ink-600">
        <span>
          {date} {time}
        </span>
        <span>{appointment.professional_name}</span>
      </div>
    </section>
  );
};
