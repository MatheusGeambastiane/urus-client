"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "@/features/services/types/service";
import type { ProfessionalProfile } from "@/features/professionals/types/professional-profile";
import { formatAppointmentDate, formatCurrency } from "@/shared/lib/formatters";
import { formatDateKey } from "../utils/date";
import { getAvailableTimes } from "../services/available-times-service";
import { groupSlotsByPeriod } from "../utils/group-slots";
import { SlotsList } from "./slots-list";
import { getProfessionals } from "@/features/professionals/services/professional-service";
import { ProfessionalSelector } from "@/features/professionals/components/professional-selector";
import { updateAppointment } from "../services/update-appointment-service";
import { Button } from "@/shared/ui/button";

const buildDateTime = (date?: string, time?: string) => {
  if (!date || !time) return null;
  return `${date}T${time}:00-03:00`;
};

type EditableAppointment = {
  id: number;
  date_time: string;
  service_id?: number | null;
  service_name?: string | null;
  price_paid?: string | null;
  professional?: number | null;
  professional_name?: string | null;
};

type EditAppointmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  appointment: EditableAppointment;
  services: Service[];
  accessToken?: string | null;
  refreshToken?: string | null;
};

type Step = "service" | "time" | "professional";

export const EditAppointmentModal = ({
  isOpen,
  onClose,
  appointment,
  services,
  accessToken,
  refreshToken,
}: EditAppointmentModalProps) => {
  const router = useRouter();
  const initialServiceId = useMemo(() => {
    if (appointment.service_id) return appointment.service_id;
    if (appointment.service_name) {
      const match = services.find(
        (service) => service.name === appointment.service_name
      );
      if (match) return match.id;
    }
    return services[0]?.id ?? null;
  }, [appointment.service_id, appointment.service_name, services]);
  const initialDate = useMemo(
    () => formatDateKey(new Date(appointment.date_time)),
    [appointment.date_time]
  );
  const initialTime = useMemo(() => {
    const parsed = new Date(appointment.date_time);
    return parsed.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, [appointment.date_time]);
  const initialProfessionalId = appointment.professional ?? null;

  const [step, setStep] = useState<Step>("service");
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    initialServiceId
  );
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    initialTime
  );
  const [selectedProfessional, setSelectedProfessional] =
    useState<ProfessionalProfile | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [professionalsLoading, setProfessionalsLoading] = useState(false);
  const [professionalsError, setProfessionalsError] = useState<string | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [services, selectedServiceId]
  );

  useEffect(() => {
    if (!isOpen) return;
    setStep("service");
    setSelectedServiceId(initialServiceId);
    setSelectedTime(initialTime);
    setSelectedProfessional(null);
    setSlots([]);
    setSlotsError(null);
    setProfessionals([]);
    setProfessionalsError(null);
    setActionError(null);
  }, [isOpen, initialServiceId, initialTime]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || step !== "time" || !selectedServiceId) return;
    let isActive = true;
    setSlotsLoading(true);
    setSlotsError(null);
    getAvailableTimes({ date: initialDate, serviceId: selectedServiceId })
      .then((response) => {
        if (!isActive) return;
        setSlots(response.slots);
      })
      .catch(() => {
        if (!isActive) return;
        setSlotsError("Nao foi possivel carregar os horarios.");
        setSlots([]);
      })
      .finally(() => {
        if (!isActive) return;
        setSlotsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isOpen, step, selectedServiceId, initialDate]);

  useEffect(() => {
    if (!isOpen || step !== "professional" || !selectedServiceId) return;
    let isActive = true;
    setProfessionalsLoading(true);
    setProfessionalsError(null);
    getProfessionals({ serviceId: selectedServiceId })
      .then((response) => {
        if (!isActive) return;
        setProfessionals(response);
        if (initialProfessionalId) {
          const match = response.find(
            (professional) => professional.id === initialProfessionalId
          );
          setSelectedProfessional(match ?? null);
        }
      })
      .catch(() => {
        if (!isActive) return;
        setProfessionalsError("Nao foi possivel carregar os profissionais.");
        setProfessionals([]);
      })
      .finally(() => {
        if (!isActive) return;
        setProfessionalsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [isOpen, step, selectedServiceId, initialProfessionalId]);

  const handleServiceSelect = (service: Service) => {
    setSelectedServiceId(service.id);
    setSelectedTime(undefined);
    setSelectedProfessional(null);
    setSlots([]);
    setProfessionals([]);
    setActionError(null);
  };

  const handleTimeSelect = (slot: string) => {
    setSelectedTime(slot);
    setActionError(null);
  };

  const handleProfessionalSelect = (professional: ProfessionalProfile) => {
    setSelectedProfessional(professional);
    setActionError(null);
  };

  const handleAdvance = () => {
    setActionError(null);
    if (step === "service") {
      setStep("time");
      return;
    }
    if (step === "time") {
      setStep("professional");
    }
  };

  const handleBack = () => {
    setActionError(null);
    if (step === "professional") {
      setStep("time");
      return;
    }
    if (step === "time") {
      setStep("service");
    }
  };

  const handleSubmit = async () => {
    setActionError(null);
    if (!accessToken) {
      setActionError("Sessao expirada. Entre novamente.");
      return;
    }
    if (!selectedServiceId || !selectedTime || !selectedProfessional) {
      setActionError("Complete todas as etapas antes de alterar.");
      return;
    }

    const dateTime = buildDateTime(initialDate, selectedTime);
    if (!dateTime) {
      setActionError("Data ou horario invalidos.");
      return;
    }

    const updatedFields: {
      serviceId?: number;
      professionalId?: number;
      dateTime?: string;
    } = {};

    if (selectedServiceId !== initialServiceId) {
      updatedFields.serviceId = selectedServiceId;
    }
    if (selectedProfessional.id !== initialProfessionalId) {
      updatedFields.professionalId = selectedProfessional.id;
    }
    if (selectedTime !== initialTime) {
      updatedFields.dateTime = dateTime;
    }

    if (
      !updatedFields.serviceId &&
      !updatedFields.professionalId &&
      !updatedFields.dateTime
    ) {
      setActionError("Nenhuma alteracao foi selecionada.");
      return;
    }

    setActionLoading(true);
    try {
      await updateAppointment({
        appointmentId: appointment.id,
        accessToken,
        refreshToken,
        ...updatedFields,
      });
      onClose();
      router.refresh();
    } catch (error) {
      setActionError("Nao foi possivel atualizar o agendamento.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  const { date } = formatAppointmentDate(appointment.date_time);
  const groupedSlots = groupSlotsByPeriod(slots);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white px-5 py-6 shadow-soft"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
              Editar agendamento
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink-900">
              {selectedService?.name ?? appointment.service_name ?? "Servico"}
            </h2>
            <p className="mt-1 text-sm text-ink-500">{date}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-600 transition hover:bg-ink-200"
            aria-label="Fechar"
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

        <div className="mt-6 space-y-4">
          {step === "service" ? (
            <section className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
                  Servico
                </p>
                <h3 className="text-lg font-semibold text-ink-900">
                  Escolha o servico
                </h3>
              </div>
              <fieldset className="max-h-64 space-y-3 overflow-y-auto rounded-3xl border border-ink-100 px-3 py-3">
                <legend className="px-2 text-xs uppercase tracking-[0.2em] text-ink-400">
                  Todos os servicos
                </legend>
                {services.map((service) => {
                  const isActive = service.id === selectedServiceId;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceSelect(service)}
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition ${
                        isActive
                          ? "bg-ink-900 text-white"
                          : "bg-white text-ink-700"
                      } shadow-soft`}
                    >
                      <span className="text-sm font-semibold">
                        {service.name}
                      </span>
                      <span className="text-xs font-semibold">
                        {formatCurrency(service.price)}
                      </span>
                    </button>
                  );
                })}
              </fieldset>
              <Button
                className="h-11 w-full"
                onClick={handleAdvance}
                disabled={!selectedServiceId}
              >
                Proximo
              </Button>
            </section>
          ) : null}

          {step === "time" ? (
            <section className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
                  Horario
                </p>
                <h3 className="text-lg font-semibold text-ink-900">
                  Escolha o horario
                </h3>
              </div>
              <fieldset className="max-h-72 space-y-3 overflow-y-auto rounded-3xl border border-ink-100 px-3 py-3">
                <legend className="px-2 text-xs uppercase tracking-[0.2em] text-ink-400">
                  Horarios disponiveis
                </legend>
                {slotsLoading ? (
                  <div className="rounded-2xl bg-ink-50 px-3 py-4 text-sm text-ink-500">
                    Carregando horarios...
                  </div>
                ) : slotsError ? (
                  <div className="rounded-2xl bg-ink-50 px-3 py-4 text-sm text-red-600">
                    {slotsError}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="rounded-2xl bg-ink-50 px-3 py-4 text-sm text-ink-500">
                    Nenhum horario disponivel para este dia.
                  </div>
                ) : (
                  <SlotsList
                    groups={groupedSlots}
                    selected={selectedTime}
                    onSelect={handleTimeSelect}
                  />
                )}
              </fieldset>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-ink-200 text-sm font-semibold text-ink-600 transition hover:bg-ink-50"
                >
                  Voltar
                </button>
                <Button
                  className="h-11 flex-1"
                  onClick={handleAdvance}
                  disabled={!selectedTime}
                >
                  Proximo
                </Button>
              </div>
            </section>
          ) : null}

          {step === "professional" ? (
            <section className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
                  Profissional
                </p>
                <h3 className="text-lg font-semibold text-ink-900">
                  Escolha o profissional
                </h3>
              </div>
              <fieldset className="max-h-72 space-y-3 overflow-y-auto rounded-3xl border border-ink-100 px-3 py-3">
                <legend className="px-2 text-xs uppercase tracking-[0.2em] text-ink-400">
                  Profissionais disponiveis
                </legend>
                {professionalsLoading ? (
                  <div className="rounded-2xl bg-ink-50 px-3 py-4 text-sm text-ink-500">
                    Carregando profissionais...
                  </div>
                ) : professionalsError ? (
                  <div className="rounded-2xl bg-ink-50 px-3 py-4 text-sm text-red-600">
                    {professionalsError}
                  </div>
                ) : professionals.length === 0 ? (
                  <div className="rounded-2xl bg-ink-50 px-3 py-4 text-sm text-ink-500">
                    Nenhum profissional disponivel.
                  </div>
                ) : (
                  <ProfessionalSelector
                    professionals={professionals}
                    selectedId={selectedProfessional?.id}
                    onSelect={handleProfessionalSelect}
                  />
                )}
              </fieldset>
              {actionError ? (
                <p className="rounded-2xl bg-red-50 px-3 py-3 text-sm text-red-600">
                  {actionError}
                </p>
              ) : null}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-ink-200 text-sm font-semibold text-ink-600 transition hover:bg-ink-50"
                >
                  Voltar
                </button>
                <Button
                  className="h-11 flex-1"
                  onClick={handleSubmit}
                  disabled={actionLoading || !selectedProfessional}
                >
                  {actionLoading ? "Alterando..." : "Alterar agendamento"}
                </Button>
              </div>
            </section>
          ) : null}

          {appointment.price_paid ? (
            <div className="rounded-2xl bg-ink-50 px-3 py-3 text-xs text-ink-600">
              Valor atual: {formatCurrency(appointment.price_paid)}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
