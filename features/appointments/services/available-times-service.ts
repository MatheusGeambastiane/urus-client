import { env } from "@/shared/config/env";
import type { AvailableTimesResponse } from "../types/available-times";

type AvailableTimesParams = {
  date: string;
  serviceId: number;
};

export const getAvailableTimes = async ({
  date,
  serviceId,
}: AvailableTimesParams): Promise<AvailableTimesResponse> => {
  const response = await fetch(
    `${env.apiBaseUrl}/webapp/appointments/available-times/?date=${date}&service_id=${serviceId}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Failed to load available times.");
  }

  return response.json();
};
