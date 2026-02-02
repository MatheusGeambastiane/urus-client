import { publicEnv } from "@/shared/config/public-env";

type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  password: string;
};

export const registerUser = async (payload: RegisterPayload) => {
  const response = await fetch(`${publicEnv.apiBaseUrl}/webapp/users/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Falha ao criar conta.");
  }

  return response.json();
};

export const requestPasswordReset = async (email: string) => {
  const response = await fetch(
    `${publicEnv.apiBaseUrl}/webapp/auth/password-reset/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Falha ao solicitar redefinicao.");
  }

  return response.json() as Promise<{ detail: string }>;
};

type ConfirmPasswordResetPayload = {
  uid: string;
  token: string;
  password: string;
};

export const confirmPasswordReset = async (
  payload: ConfirmPasswordResetPayload
) => {
  const response = await fetch(
    `${publicEnv.apiBaseUrl}/webapp/auth/password-reset/confirm/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Falha ao redefinir senha.");
  }

  return response.json() as Promise<{ detail: string }>;
};
