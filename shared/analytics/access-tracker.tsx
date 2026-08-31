"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  getPortalVisitId,
  getPortalVisitorId,
  reportPortalAccessError,
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
  }, [accessToken, pathname]);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportPortalAccessError({
        kind: "javascript",
        message: event.message || "Erro JavaScript não identificado",
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const message =
        event.reason instanceof Error
          ? event.reason.message
          : "Promise rejeitada sem tratamento";
      reportPortalAccessError({ kind: "unhandled_promise", message });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
};
