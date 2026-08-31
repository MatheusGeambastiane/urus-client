import { env } from "@/shared/config/env";
import { fetchWithAuth } from "@/shared/auth/auth-fetch";
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
  const { response } = await fetchWithAuth(
    `${env.apiBaseUrl}/webapp/appointments/recent/?page=${page}&page_size=${pageSize}`,
    { cache: "no-store" },
    { accessToken }
  );

  if (!response.ok) {
    throw new Error("Failed to load appointments.");
  }

  return response.json();
};
