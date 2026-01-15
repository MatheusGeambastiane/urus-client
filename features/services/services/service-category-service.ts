import { env } from "@/shared/config/env";
import type { ServiceCategory } from "../types/service-category";

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  const response = await fetch(
    `${env.apiBaseUrl}/webapp/service-categories/`,
    {
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load service categories.");
  }

  return response.json();
};
