import { env } from "@/shared/config/env";
import { fetchWithAuth } from "@/shared/auth/auth-fetch";
import type { NextAppointment } from "../types/next-appointment";

type NextAppointmentParams = {
  accessToken: string;
  refreshToken?: string | null;
};

export const getNextAppointment = async ({
  accessToken,
  refreshToken,
}: NextAppointmentParams): Promise<NextAppointment | null> => {
  const { response } = await fetchWithAuth(
    `${env.apiBaseUrl}/webapp/appointments/next/`,
    { cache: "no-store" },
    { accessToken, refreshToken, baseUrl: env.apiBaseUrl }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load next appointment.");
  }

  return response.json();
};
