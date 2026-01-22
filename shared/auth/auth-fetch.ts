type FetchWithAuthOptions = {
  accessToken?: string | null;
  refreshToken?: string | null;
  baseUrl: string;
};

const isTokenInvalidResponse = (data: unknown) => {
  if (!data || typeof data !== "object") return false;
  const payload = data as { code?: string; detail?: string };
  return (
    payload.code === "token_not_valid" ||
    payload.detail === "Given token not valid for any token type"
  );
};

const refreshAccessToken = async (
  baseUrl: string,
  refreshToken: string
): Promise<string | null> => {
  const response = await fetch(`${baseUrl}/webapp/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { access?: string; token?: string };
  return data.access ?? data.token ?? null;
};

export const fetchWithAuth = async (
  url: string,
  init: RequestInit,
  { accessToken, refreshToken, baseUrl }: FetchWithAuthOptions
) => {
  const headers = new Headers(init.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, { ...init, headers });

  if (!response.ok && refreshToken) {
    const errorData = await response.clone().json().catch(() => null);
    if (isTokenInvalidResponse(errorData)) {
      const nextAccess = await refreshAccessToken(baseUrl, refreshToken);
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
