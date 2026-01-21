"use client";

import { useEffect, useMemo, useState } from "react";
import type { Service } from "@/features/services/types/service";
import { formatCurrency, formatDuration } from "@/shared/lib/formatters";
import { DateCarousel } from "./date-carousel";
import { SlotsList } from "./slots-list";
import { buildDateOptions } from "../utils/date";
import { groupSlotsByPeriod } from "../utils/group-slots";
import { getAvailableTimes } from "../services/available-times-service";
import {
  loadAppointmentDraft,
  saveAppointmentDraft,
} from "../utils/appointment-storage";
import type { AppointmentDraft } from "../types/appointment-draft";
import Link from "next/link";

type AvailabilityScreenProps = {
  service: Service;
};

export const AvailabilityScreen = ({ service }: AvailabilityScreenProps) => {
  const dateOptions = useMemo(() => buildDateOptions(10), []);
  const initialDate = dateOptions[0]?.key ?? "";
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [hasMounted, setHasMounted] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const groupedSlots = useMemo(() => groupSlotsByPeriod(slots), [slots]);

  useEffect(() => {
    setHasMounted(true);
    const draft = loadAppointmentDraft();
    if (!draft) return;
    if (draft.date && dateOptions.some((option) => option.key === draft.date)) {
      setSelectedDate(draft.date);
    }
  }, [dateOptions]);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlotsError(null);
      try {
        const response = await getAvailableTimes({
          date: selectedDate,
          serviceId: service.id,
        });
        setSlots(response.slots);
      } catch (error) {
        setSlotsError("Nao foi possivel carregar os horarios.");
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
    setSelectedTime((current) =>
      current && selectedDate === loadAppointmentDraft()?.date ? current : undefined
    );
  }, [selectedDate, service.id]);

  useEffect(() => {
    const previous = loadAppointmentDraft() ?? ({} as AppointmentDraft);
    const draft: AppointmentDraft = {
      ...previous,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      date: selectedDate,
      time: selectedTime,
    };
    saveAppointmentDraft(draft);
  }, [selectedDate, selectedTime, service.id, service.name, service.price]);

  return (
    <div className="space-y-10">
      <section className="rounded-[28px] bg-white px-5 py-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
          Servico selecionado
        </p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-900">
              {service.name}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-ink-500">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink-100">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 7V12L15 15"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
              <span>{formatDuration(service.duration)}</span>
            </div>
          </div>
          <span className="text-lg font-semibold text-ink-900">
            {formatCurrency(service.price)}
          </span>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
            Escolha o dia
          </p>
          <h2 className="font-display text-xl font-semibold text-ink-900">
            Datas disponiveis
          </h2>
        </div>
        <DateCarousel
          options={dateOptions}
          selected={selectedDate}
          onSelect={setSelectedDate}
        />
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
            Escolha o horario
          </p>
          <h2 className="font-display text-xl font-semibold text-ink-900">
            Horarios disponiveis
          </h2>
        </div>

        {slotsLoading ? (
          <div className="rounded-3xl bg-white px-4 py-6 text-sm text-ink-500 shadow-soft">
            Carregando horarios...
          </div>
        ) : slotsError ? (
          <div className="rounded-3xl bg-white px-4 py-6 text-sm text-red-600 shadow-soft">
            {slotsError}
          </div>
        ) : slots.length === 0 ? (
          <div className="rounded-3xl bg-white px-4 py-6 text-sm text-ink-500 shadow-soft">
            Nenhum horario disponivel para este dia.
          </div>
        ) : (
          <SlotsList
            groups={groupedSlots}
            selected={selectedTime}
            onSelect={setSelectedTime}
          />
        )}
      </section>

      {hasMounted && selectedTime ? (
        <div className="fixed bottom-24 left-0 right-0 z-10 border-t border-ink-100 bg-white/95 px-4 py-4 backdrop-blur">
          <div className="mx-auto w-full max-w-md">
            <Link
              href={`/services/${service.id}/schedule/professionals`}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white transition hover:bg-ink-700"
            >
              Selecionar profissional
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
};
