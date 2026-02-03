"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import type { NextAppointment } from "../types/next-appointment";
import { updateAppointment } from "@/features/appointments/services/update-appointment-service";
import { fetchWithAuth } from "@/shared/auth/auth-fetch";
import { formatAppointmentDate, formatCurrency } from "@/shared/lib/formatters";
import { publicEnv } from "@/shared/config/public-env";
import { EditAppointmentModal } from "./edit-appointment-modal";
import type { Service } from "@/features/services/types/service";

type NextAppointmentCardProps = {
  appointment: NextAppointment;
  services: Service[];
  accessToken?: string | null;
  refreshToken?: string | null;
};

export const NextAppointmentCard = ({
  appointment,
  services,
  accessToken,
  refreshToken,
}: NextAppointmentCardProps) => {
  const [currentAppointment, setCurrentAppointment] =
    useState<NextAppointment | null>(appointment);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<"cancel" | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const activeAppointment = currentAppointment;

  if (!activeAppointment) {
    return null;
  }

  const { date, time } = formatAppointmentDate(activeAppointment.date_time);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
    setConfirmCancel(false);
    setActionError(null);
  };

  const handleCancelRequest = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setConfirmCancel(true);
    setActionError(null);
  };

  const fetchNextAppointment = async () => {
    if (!accessToken) return null;
    const { response } = await fetchWithAuth(
      `${publicEnv.apiBaseUrl}/webapp/appointments/next/`,
      { cache: "no-store" },
      { accessToken, refreshToken, baseUrl: publicEnv.apiBaseUrl }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Failed to load next appointment.");
    }

    return response.json();
  };

  const handleCancelConfirm = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    if (!accessToken) {
      setActionError("Sessao expirada. Entre novamente.");
      return;
    }

    setActionLoading("cancel");
    setActionError(null);
    try {
      await updateAppointment({
        appointmentId: activeAppointment.id,
        status: "cancelado",
        accessToken,
        refreshToken,
      });
      const next = await fetchNextAppointment().catch(() => null);
      setCurrentAppointment(next);
      setIsExpanded(false);
      setConfirmCancel(false);
    } catch (error) {
      setActionError("Nao foi possivel cancelar o agendamento.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelDismiss = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setConfirmCancel(false);
  };

  const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (confirmCancel) return;
    const serviceId =
      activeAppointment.service_id ??
      (activeAppointment as { service?: number | null }).service ??
      null;
    if (!serviceId) {
      setActionError("Servico nao encontrado para editar o agendamento.");
      return;
    }

    setIsEditOpen(true);
  };

  return (
    <>
      <section
        onClick={handleToggle}
        className={`relative rounded-[28px] px-5 py-5 shadow-soft transition-colors duration-300 ${
          confirmCancel ? "bg-red-600" : isExpanded ? "bg-ink-900" : "bg-white"
        }`}
        role="button"
        aria-expanded={isExpanded}
      >
        <div className="relative flex items-center justify-between gap-4">
          <div
            className={`flex-1 transition-all duration-300 ${
              isExpanded
                ? "pointer-events-none -translate-y-2 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
              Proximo agendamento
            </p>
            <h3 className="mt-2 text-lg font-semibold text-ink-900">
              {activeAppointment.service_name}
            </h3>
            <div className="mt-4 flex items-center justify-between text-sm text-ink-600">
              <span>
                {date} {time}
              </span>
              <span>{activeAppointment.professional_name}</span>
            </div>
          </div>

          <div
            className={`transition-opacity duration-300 ${
              isExpanded ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="text-sm font-semibold text-ink-700">
              {formatCurrency(activeAppointment.price_paid)}
            </span>
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-between gap-4 transition-all duration-300 ${
              isExpanded && !confirmCancel
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`}
          >
            <div className="flex flex-1 flex-col gap-2 text-white">
              <h3 className="text-lg font-semibold">
                {activeAppointment.service_name}
              </h3>
              <span className="text-sm">
                {date} {time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEdit}
                disabled={actionLoading === "cancel"}
                aria-label="Editar atendimento"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10 disabled:opacity-60"
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
              <button
                type="button"
                onClick={handleCancelRequest}
                disabled={actionLoading === "cancel"}
                aria-label="Cancelar atendimento"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10 disabled:opacity-60"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-between gap-4 transition-all duration-300 ${
              confirmCancel
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`}
          >
            <p className="max-w-[60%] text-sm font-semibold text-white">
              Voce deseja realmente cancelar esse atendimento?
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={actionLoading === "cancel"}
                className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-xs font-semibold text-red-600 transition hover:bg-white/90 disabled:opacity-60"
              >
                {actionLoading === "cancel" ? "Cancelando..." : "Sim"}
              </button>
              <button
                type="button"
                onClick={handleCancelDismiss}
                disabled={actionLoading === "cancel"}
                className="inline-flex h-9 items-center justify-center rounded-full border border-white/40 px-4 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
              >
                Nao
              </button>
            </div>
          </div>
        </div>

        {actionError ? <p className="sr-only">{actionError}</p> : null}
      </section>
      <EditAppointmentModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        appointment={{
          id: activeAppointment.id,
          date_time: activeAppointment.date_time,
          service_id:
            activeAppointment.service_id ??
            (activeAppointment as { service?: number | null }).service ??
            null,
          service_name: activeAppointment.service_name,
          price_paid: activeAppointment.price_paid,
          professional: activeAppointment.professional,
          professional_name: activeAppointment.professional_name,
        }}
        services={services}
        accessToken={accessToken}
        refreshToken={refreshToken}
      />
    </>
  );
};
