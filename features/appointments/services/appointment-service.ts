import { publicEnv } from "@/shared/config/public-env";

type AppointmentPayload = {
  serviceId: number;
  professionalId: number;
  dateTime: string;
  accessToken?: string | null;
};

export const createAppointment = async ({
  serviceId,
  professionalId,
  dateTime,
  accessToken,
}: AppointmentPayload) => {
  const response = await fetch(`${publicEnv.apiBaseUrl}/webapp/appointments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      service_id: serviceId,
      date_time: dateTime,
      professional: professionalId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Falha ao criar agendamento.");
  }

  return response.json();
};
