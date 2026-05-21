import { env } from "@/shared/config/env";
import type { ProfessionalProfile } from "../types/professional-profile";

type ProfessionalParams = {
  serviceId: number;
  date?: string;
  time?: string;
};

export const getProfessionals = async ({
  serviceId,
  date,
  time,
}: ProfessionalParams): Promise<ProfessionalProfile[]> => {
  const params = new URLSearchParams({
    service_id: String(serviceId),
  });

  if (date) params.set("date", date);
  if (time) params.set("time", time);

  const response = await fetch(
    `${env.apiBaseUrl}/webapp/professional-profiles/?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Failed to load professionals.");
  }

  return response.json();
};
