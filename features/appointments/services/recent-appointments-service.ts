import { env } from "@/shared/config/env";
import { fetchWithAuth } from "@/shared/auth/auth-fetch";
import type { RecentAppointmentsResponse } from "../types/recent-appointments";

type RecentAppointmentsParams = {
  accessToken: string;
  refreshToken?: string | null;
  page?: number;
  pageSize?: number;
};

export const getRecentAppointments = async ({
  accessToken,
  refreshToken,
  page = 1,
  pageSize = 2,
}: RecentAppointmentsParams): Promise<RecentAppointmentsResponse> => {
  const { response } = await fetchWithAuth(
    `${env.apiBaseUrl}/webapp/appointments/recent/?page=${page}&page_size=${pageSize}`,
    { cache: "no-store" },
    { accessToken, refreshToken, baseUrl: env.apiBaseUrl }
  );

  if (!response.ok) {
    throw new Error("Failed to load appointments.");
  }

  return response.json();
};
