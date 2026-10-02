"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  getPortalVisitId,
  getPortalVisitorId,
  reportPortalAccessError,
  trackPortalFlowEvent,
} from "@/shared/analytics/portal-access";
import { publicEnv } from "@/shared/config/public-env";

const clean = (value: string | null, max = 255) => (value ?? "").slice(0, max);

const referrerOrigin = () => {
  if (!document.referrer) return "";
  try {
    return new URL(document.referrer).origin.slice(0, 255);
  } catch {
    return "";
  }
};

export const AccessTracker = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string | null } | undefined)
    ?.accessToken;
  const trackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!publicEnv.apiBaseUrl) return;
    const visitId = getPortalVisitId();
    const visitorId = getPortalVisitorId();
    if (!visitId || !visitorId) return;

    const params = new URLSearchParams(window.location.search);
    const headers = new Headers({ "Content-Type": "application/json" });
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    void fetch(`${publicEnv.apiBaseUrl}/webapp/analytics/visits/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        visit_id: visitId,
        visitor_id: visitorId,
        landing_path: `${pathname}${window.location.search}`.slice(0, 500),
        referrer_origin: referrerOrigin(),
        utm_source: clean(params.get("utm_source")),
        utm_medium: clean(params.get("utm_medium")),
        utm_campaign: clean(params.get("utm_campaign")),
        utm_content: clean(params.get("utm_content")),
        utm_term: clean(params.get("utm_term")),
      }),
      keepalive: true,
    }).catch(() => undefined);

    if (trackedPath.current !== pathname) {
      trackedPath.current = pathname;
      if (pathname === "/") trackPortalFlowEvent("home_view");
      if (/^\/services\/[^/]+\/schedule\/?$/.test(pathname)) {
        trackPortalFlowEvent("service_selected", { path: pathname });
      }
    }
    if (accessToken && params.get("continue_scheduling") === "true") {
      trackPortalFlowEvent("authenticated");
    }
  }, [accessToken, pathname]);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportPortalAccessError({
        kind: "javascript",
        message: event.message || "Erro JavaScript não identificado",
        log: {
          error: event.error,
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
        },
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason instanceof Error
        ? event.reason.message
        : typeof event.reason === "string"
          ? event.reason
          : "Promise rejeitada sem tratamento";
      reportPortalAccessError({
        kind: "unhandled_promise",
        message,
        log: { reason: event.reason },
      });
    };

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const requestUrl = typeof args[0] === "string"
        ? args[0]
        : args[0] instanceof URL
          ? args[0].toString()
          : args[0].url;
      const requestMethod = (args[1]?.method ?? (args[0] instanceof Request ? args[0].method : "GET")).toUpperCase();
      const isAnalyticsRequest = requestUrl.includes("/webapp/analytics/");
      const isHandledAppointmentRequest = requestMethod === "POST"
        && new URL(requestUrl, window.location.href).pathname.endsWith("/webapp/appointments/");
      try {
        const response = await originalFetch(...args);
        if (!response.ok && response.status !== 401 && response.status !== 404 && !isAnalyticsRequest && !isHandledAppointmentRequest) {
          const responseBody = await response.clone().text().catch(() => "");
          reportPortalAccessError({
            kind: "http",
            message: `Falha HTTP em ${requestMethod} ${new URL(requestUrl, window.location.href).pathname}`,
            statusCode: response.status,
            log: {
              method: requestMethod,
              url: requestUrl,
              status_text: response.statusText,
              response: responseBody.slice(0, 8_000),
            },
          });
        }
        return response;
      } catch (error) {
        if (!isAnalyticsRequest && !isHandledAppointmentRequest) {
          reportPortalAccessError({
            kind: "network",
            message: error instanceof Error ? error.message : "Falha de rede não identificada",
            log: { method: requestMethod, url: requestUrl, error },
          });
        }
        throw error;
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.fetch = originalFetch;
    };
  }, []);

  return null;
};
