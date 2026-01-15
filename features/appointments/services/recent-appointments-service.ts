import { env } from "@/shared/config/env";
import type { RecentAppointmentsResponse } from "../types/recent-appointments";

type RecentAppointmentsParams = {
  accessToken: string;
  page?: number;
  pageSize?: number;
};

export const getRecentAppointments = async ({
  accessToken,
  page = 1,
  pageSize = 2,
}: RecentAppointmentsParams): Promise<RecentAppointmentsResponse> => {
  const response = await fetch(
    `${env.apiBaseUrl}/webapp/appointments/recent/?page=${page}&page_size=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load appointments.");
  }

  return response.json();
};
