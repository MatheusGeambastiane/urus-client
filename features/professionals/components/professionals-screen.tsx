"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { ProfessionalProfile } from "../types/professional-profile";
import { ProfessionalSelector } from "./professional-selector";
import { Button } from "@/shared/ui/button";
import {
  loadAppointmentDraft,
  saveAppointmentDraft,
} from "@/features/appointments/utils/appointment-storage";
import type { AppointmentDraft } from "@/features/appointments/types/appointment-draft";
import { createAppointment } from "@/features/appointments/services/appointment-service";

type ProfessionalsScreenProps = {
  professionals: ProfessionalProfile[];
  continueScheduling?: boolean;
};

export const ProfessionalsScreen = ({
  professionals,
  continueScheduling = false,
}: ProfessionalsScreenProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedProfessional, setSelectedProfessional] =
    useState<ProfessionalProfile | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const appointmentDraft = useMemo(() => loadAppointmentDraft(), []);

  useEffect(() => {
    const draft = loadAppointmentDraft();
    if (!draft?.professionalId) return;
    const match = professionals.find(
      (professional) => professional.id === draft.professionalId
    );
    if (match) {
      setSelectedProfessional(match);
    }
  }, [professionals]);

  useEffect(() => {
    const previous = loadAppointmentDraft() ?? ({} as AppointmentDraft);
    const next: AppointmentDraft = {
      ...previous,
      professionalId: selectedProfessional?.id,
      professionalName: selectedProfessional?.user_name,
    };
    saveAppointmentDraft(next);
  }, [selectedProfessional]);

  const buildDateTime = (date?: string, time?: string) => {
    if (!date || !time) return null;
    return `${date}T${time}:00-03:00`;
  };

  const handleConfirm = async () => {
    setConfirmError(null);

    if (status !== "authenticated") {
      const pathWithContinue = `${window.location.pathname}?continue_scheduling=true`;
      const redirect = encodeURIComponent(pathWithContinue);
      router.push(`/auth?tab=login&redirect=${redirect}&continue_scheduling=true`);
      return;
    }

    const draft = loadAppointmentDraft();
    const dateTime = buildDateTime(draft?.date, draft?.time);
    if (!draft?.serviceId || !draft?.professionalId || !dateTime) {
      setConfirmError("Complete o agendamento antes de confirmar.");
      return;
    }

    const token = (session?.user as { accessToken?: string | null })?.accessToken;

    setConfirmLoading(true);
    try {
      await createAppointment({
        serviceId: draft.serviceId,
        professionalId: draft.professionalId,
        dateTime,
        accessToken: token,
      });
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/");
      }, 1800);
    } catch (error) {
      setConfirmError("Nao foi possivel confirmar o agendamento.");
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
          Ultima etapa
        </p>
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Escolha o profissional
        </h1>
        <p className="text-sm text-ink-600">
          Selecione quem vai realizar o seu atendimento.
        </p>
      </header>

      {appointmentDraft ? (
        <div className="rounded-3xl bg-white px-4 py-4 text-sm text-ink-600 shadow-soft">
          <p className="font-semibold text-ink-900">
            {appointmentDraft.serviceName}
          </p>
          <p>
            {appointmentDraft.date} {appointmentDraft.time}
          </p>
          {continueScheduling ? (
            <p className="mt-1 text-ink-500">
              {appointmentDraft.professionalName ?? "Profissional nao definido"}
            </p>
          ) : null}
        </div>
      ) : null}

      <ProfessionalSelector
        professionals={professionals}
        selectedId={selectedProfessional?.id}
        onSelect={setSelectedProfessional}
      />

      {confirmError ? (
        <div className="rounded-3xl bg-white px-4 py-3 text-sm text-red-600 shadow-soft">
          {confirmError}
        </div>
      ) : null}

      {selectedProfessional ? (
        <Button
          className="h-12 w-full"
          onClick={handleConfirm}
          disabled={confirmLoading}
        >
          {confirmLoading ? "Confirmando..." : "Confirmar agendamento"}
        </Button>
      ) : null}

      {showToast ? (
        <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-soft">
          Agendamento confirmado
        </div>
      ) : null}
    </div>
  );
};
