type FetchWithAuthOptions = {
  accessToken?: string | null;
};

const isTokenInvalidResponse = (data: unknown) => {
  if (!data || typeof data !== "object") return false;
  const payload = data as { code?: string; detail?: string };
  return (
    payload.code === "token_not_valid" ||
    payload.detail === "Given token not valid for any token type"
  );
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  if (!response.ok) return null;
  const session = (await response.json()) as { user?: { accessToken?: string | null } };
  return session.user?.accessToken ?? null;
};

export const fetchWithAuth = async (
  url: string,
  init: RequestInit,
  { accessToken }: FetchWithAuthOptions
) => {
  const headers = new Headers(init.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, { ...init, headers });

  if (!response.ok) {
    const errorData = await response.clone().json().catch(() => null);
    if (isTokenInvalidResponse(errorData)) {
      const nextAccess = await refreshAccessToken();
      if (nextAccess) {
        const retryHeaders = new Headers(init.headers);
        retryHeaders.set("Authorization", `Bearer ${nextAccess}`);
        const retryResponse = await fetch(url, { ...init, headers: retryHeaders });
        return { response: retryResponse, accessToken: nextAccess };
      }
    }
  }

  return { response, accessToken: accessToken ?? null };
};
