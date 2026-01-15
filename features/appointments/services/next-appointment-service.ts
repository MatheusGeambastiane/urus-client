import { env } from "@/shared/config/env";
import type { NextAppointment } from "../types/next-appointment";

type NextAppointmentParams = {
  accessToken: string;
};

export const getNextAppointment = async ({
  accessToken,
}: NextAppointmentParams): Promise<NextAppointment | null> => {
  const response = await fetch(`${env.apiBaseUrl}/webapp/appointments/next/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load next appointment.");
  }

  return response.json();
};
