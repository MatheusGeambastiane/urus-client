export function safeRelativeRedirect(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const parsed = new URL(value, "https://local.invalid");
    if (parsed.origin !== "https://local.invalid") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
