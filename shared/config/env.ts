export const env = {
  apiBaseUrl:
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "",
  nextAuthSecret: process.env.NEXTAUTH_SECRET ?? "",
};

if (!env.apiBaseUrl) {
  throw new Error("Missing API base URL env var.");
}
