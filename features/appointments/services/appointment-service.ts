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
    const responseText = await response.clone().text().catch(() => "");
    let responseLog: unknown = responseText;
    try {
      responseLog = responseText ? JSON.parse(responseText) : null;
    } catch {
      // Preserve non-JSON responses as text for diagnostics.
    }
    reportPortalAccessError({
      kind: "appointment_api",
      message: "Falha ao criar agendamento",
      statusCode: response.status,
      log: {
        response: responseLog,
        request: { service_id: serviceId, professional_id: professionalId, date_time: dateTime },
      },
    });
    throw new Error(responseText || "Falha ao criar agendamento.");
  }

  return response.json();
};
