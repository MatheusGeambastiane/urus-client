import { publicEnv } from "@/shared/config/public-env";
import { fetchWithAuth } from "@/shared/auth/auth-fetch";

type UpdateAppointmentPayload = {
  appointmentId: number;
  accessToken?: string | null;
  refreshToken?: string | null;
  status?: string;
  dateTime?: string;
  professionalId?: number;
  serviceId?: number;
};

export const updateAppointment = async ({
  appointmentId,
  accessToken,
  refreshToken,
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

  const { response } = await fetchWithAuth(
    `${publicEnv.apiBaseUrl}/webapp/appointments/${appointmentId}/update/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    { accessToken, refreshToken, baseUrl: publicEnv.apiBaseUrl }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Falha ao atualizar agendamento.");
  }

  return response.json();
};
