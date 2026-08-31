import { publicEnv } from "@/shared/config/public-env";

const VISIT_KEY = "urus_portal_visit_id";
const VISITOR_KEY = "urus_portal_visitor_id";

const createUuid = () => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (character) =>
    (Number(character) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(character) / 4)))).toString(16),
  );
};

const getStoredUuid = (storage: Storage, key: string) => {
  const current = storage.getItem(key);
  if (current) return current;
  const created = createUuid();
  storage.setItem(key, created);
  return created;
};

export const getPortalVisitId = () => {
  if (typeof window === "undefined") return null;
  try {
    return getStoredUuid(window.sessionStorage, VISIT_KEY);
  } catch {
    return null;
  }
};

export const getPortalVisitorId = () => {
  if (typeof window === "undefined") return null;
  try {
    return getStoredUuid(window.localStorage, VISITOR_KEY);
  } catch {
    return null;
  }
};

type AccessError = {
  kind: string;
  message: string;
  statusCode?: number;
};

export const reportPortalAccessError = ({
  kind,
  message,
  statusCode,
}: AccessError) => {
  if (typeof window === "undefined" || !publicEnv.apiBaseUrl) return;
  const visitId = getPortalVisitId();
  if (!visitId) return;

  void fetch(`${publicEnv.apiBaseUrl}/webapp/analytics/errors/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visit_id: visitId,
      path: `${window.location.pathname}${window.location.search}`.slice(0, 500),
      kind: kind.slice(0, 80),
      message: message.slice(0, 500),
      status_code: statusCode,
    }),
    keepalive: true,
  }).catch(() => undefined);
};
