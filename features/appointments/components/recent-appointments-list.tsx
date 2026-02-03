"use client";

import { useMemo, useState } from "react";
import type { RecentAppointment } from "../types/recent-appointments";
import { formatAppointmentDate, formatCurrency } from "@/shared/lib/formatters";
import { EditAppointmentModal } from "./edit-appointment-modal";
import type { Service } from "@/features/services/types/service";

type RecentAppointmentsListProps = {
  items: RecentAppointment[];
  services: Service[];
  accessToken?: string | null;
  refreshToken?: string | null;
};

export const RecentAppointmentsList = ({
  items,
  services,
  accessToken,
  refreshToken,
}: RecentAppointmentsListProps) => {
  const [editing, setEditing] = useState<RecentAppointment | null>(null);
  const editingAppointment = useMemo(() => {
    if (!editing) return null;
    const serviceFromList = services.find(
      (service) => service.id === (editing.service_id ?? editing.services[0]?.id)
    );
    return {
      id: editing.id,
      date_time: editing.date_time,
      service_id: editing.service_id ?? editing.services[0]?.id ?? null,
      service_name: serviceFromList?.name ?? editing.services[0]?.name ?? "Servico",
      price_paid: editing.price_paid,
      professional: editing.professional ?? editing.professional_id ?? null,
      professional_name: editing.professional_name,
    };
  }, [editing, services]);

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
              <div className="flex flex-col items-end gap-2">
                {item.status === "agendado" ? (
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    aria-label="Editar atendimento"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition hover:bg-ink-50"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 17.25V21H6.75L18.37 9.38L14.62 5.63L3 17.25Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14.62 5.63L16.75 3.5L20.5 7.25L18.37 9.38L14.62 5.63Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : null}
                <span className="text-sm font-semibold text-ink-700">
                  {formatCurrency(item.price_paid)}
                </span>
              </div>
            </div>
          </article>
        );
      })}
      {editingAppointment ? (
        <EditAppointmentModal
          isOpen={Boolean(editingAppointment)}
          onClose={() => setEditing(null)}
          appointment={editingAppointment}
          services={services}
          accessToken={accessToken}
          refreshToken={refreshToken}
        />
      ) : null}
    </div>
  );
};
