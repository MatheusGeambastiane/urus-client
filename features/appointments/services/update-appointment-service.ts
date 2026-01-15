import { publicEnv } from "@/shared/config/public-env";

type UpdateAppointmentPayload = {
  appointmentId: number;
  accessToken?: string | null;
  status?: string;
  dateTime?: string;
  professionalId?: number;
  serviceId?: number;
};

export const updateAppointment = async ({
  appointmentId,
  accessToken,
  status,
  dateTime,
  professionalId,
  serviceId,
}: UpdateAppointmentPayload) => {
  const body: Record<string, unknown> = {};
  if (status) body.status = status;
  if (dateTime) body.date_time = dateTime;
  if (typeof professionalId === "number") body.professional = professionalId;
  if (typeof serviceId === "number") body.service_id = serviceId;

  const response = await fetch(
    `${publicEnv.apiBaseUrl}/webapp/appointments/${appointmentId}/update/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Falha ao atualizar agendamento.");
  }

  return response.json();
};
