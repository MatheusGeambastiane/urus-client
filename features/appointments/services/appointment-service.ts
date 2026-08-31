import { publicEnv } from "@/shared/config/public-env";
import { fetchWithAuth } from "@/shared/auth/auth-fetch";
import {
  getPortalVisitId,
  reportPortalAccessError,
} from "@/shared/analytics/portal-access";

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
  const visitId = getPortalVisitId();
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
        ...(visitId ? { visit_id: visitId } : {}),
      }),
    },
    { accessToken }
  );

  if (!response.ok) {
    reportPortalAccessError({
      kind: "appointment_api",
      message: "Falha ao criar agendamento",
      statusCode: response.status,
    });
    const errorText = await response.text();
    throw new Error(errorText || "Falha ao criar agendamento.");
  }

  return response.json();
};
