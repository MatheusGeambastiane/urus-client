import { env } from "@/shared/config/env";
import type { UserProfile } from "../types/user-profile";

type UserProfileParams = {
  accessToken: string;
};

export const getUserProfile = async ({
  accessToken,
}: UserProfileParams): Promise<UserProfile> => {
  const response = await fetch(`${env.apiBaseUrl}/webapp/users/me/`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load user profile.");
  }

  return response.json();
};
