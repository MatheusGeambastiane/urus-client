import { env } from "@/shared/config/env";
import type { Service } from "../types/service";

export const getServices = async (search = ""): Promise<Service[]> => {
  const response = await fetch(
    `${env.apiBaseUrl}/webapp/services/?search=${encodeURIComponent(search)}`,
    {
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load services.");
  }

  return response.json();
};
