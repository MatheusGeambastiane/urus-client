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
  log?: unknown;
};

export type PortalFlowEvent =
  | "home_view"
  | "service_selected"
  | "time_selected"
  | "professional_selected"
  | "authenticated";

const REDACTED_KEYS = /authorization|cookie|password|secret|token/i;

const sanitizeLogValue = (value: unknown, depth = 0): unknown => {
  if (depth > 4) return "[limite de profundidade]";
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack?.slice(0, 6_000),
      cause: value.cause ? sanitizeLogValue(value.cause, depth + 1) : undefined,
    };
  }
  if (typeof value === "string") return value.slice(0, 8_000);
  if (typeof value === "number" || typeof value === "boolean" || value == null) return value;
  if (Array.isArray(value)) return value.slice(0, 30).map((item) => sanitizeLogValue(item, depth + 1));
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value).slice(0, 50)) {
      result[key] = REDACTED_KEYS.test(key) ? "[redigido]" : sanitizeLogValue(item, depth + 1);
    }
    return result;
  }
  return String(value).slice(0, 2_000);
};

const clientContext = () => ({
  url: window.location.href.slice(0, 1_000),
  user_agent: navigator.userAgent.slice(0, 1_000),
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  online: navigator.onLine,
});

export const reportPortalAccessError = ({
  kind,
  message,
  statusCode,
  log,
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
      log: sanitizeLogValue({
        context: clientContext(),
        detail: log,
      }),
    }),
    keepalive: true,
  }).catch(() => undefined);
};

export const trackPortalFlowEvent = (
  eventType: PortalFlowEvent,
  metadata?: Record<string, unknown>,
) => {
  if (typeof window === "undefined" || !publicEnv.apiBaseUrl) return;
  const visitId = getPortalVisitId();
  if (!visitId) return;

  const eventKey = `urus_portal_event_${visitId}_${eventType}`;
  let eventId: string;
  try {
    eventId = window.sessionStorage.getItem(eventKey) ?? createUuid();
    window.sessionStorage.setItem(eventKey, eventId);
  } catch {
    eventId = createUuid();
  }

  void fetch(`${publicEnv.apiBaseUrl}/webapp/analytics/events/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_id: eventId,
      visit_id: visitId,
      event_type: eventType,
      path: `${window.location.pathname}${window.location.search}`.slice(0, 500),
      metadata: sanitizeLogValue(metadata),
    }),
    keepalive: true,
  }).catch(() => undefined);
};
