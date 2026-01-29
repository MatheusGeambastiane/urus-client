import { publicEnv } from "@/shared/config/public-env";
import { fetchWithAuth } from "@/shared/auth/auth-fetch";

type AppointmentPayload = {
  serviceId: number;
  professionalId: number;
  dateTime: string;
  accessToken?: string | null;
  refreshToken?: string | null;
};

export const createAppointment = async ({
  serviceId,
  professionalId,
  dateTime,
  accessToken,
  refreshToken,
}: AppointmentPayload) => {
  const { response } = await fetchWithAuth(
    `${publicEnv.apiBaseUrl}/webapp/appointments/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        date_time: dateTime,
        professional: professionalId,
        appointment_origin: "schedule_system",
      }),
    },
    { accessToken, refreshToken, baseUrl: publicEnv.apiBaseUrl }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Falha ao criar agendamento.");
  }

  return response.json();
};
