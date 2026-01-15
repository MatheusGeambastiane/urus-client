import { env } from "@/shared/config/env";
import type { ProfessionalProfile } from "../types/professional-profile";

type ProfessionalParams = {
  serviceId: number;
};

export const getProfessionals = async ({
  serviceId,
}: ProfessionalParams): Promise<ProfessionalProfile[]> => {
  const response = await fetch(
    `${env.apiBaseUrl}/webapp/professional-profiles/?service_id=${serviceId}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Failed to load professionals.");
  }

  return response.json();
};
