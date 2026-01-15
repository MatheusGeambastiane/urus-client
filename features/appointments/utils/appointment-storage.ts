import type { AppointmentDraft } from "../types/appointment-draft";

const STORAGE_KEY = "appointmentDraft";

export const saveAppointmentDraft = (draft: AppointmentDraft) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
};

export const loadAppointmentDraft = () => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppointmentDraft;
  } catch {
    return null;
  }
};
