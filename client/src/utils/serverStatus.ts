import axios from "axios";

export type ServerStatus = "ok" | "unavailable";

const SLOW_REQUEST_MS = 8000;

let status: ServerStatus = "ok";
let pending = 0;
let slowTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

const setStatus = (next: ServerStatus) => {
  if (next === status) return;
  status = next;
  listeners.forEach((listener) => listener());
};

export const subscribeServerStatus = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getServerStatus = () => status;

export const isServerUnavailableError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error) || error.code === "ERR_CANCELED") return false;
  if (!error.response) return true;
  return [502, 503, 504].includes(error.response.status);
};

export const trackRequestStart = () => {
  pending += 1;
  if (!slowTimer) {
    slowTimer = setTimeout(() => {
      slowTimer = null;
      if (pending > 0) setStatus("unavailable");
    }, SLOW_REQUEST_MS);
  }
};

export const trackRequestEnd = (error?: unknown) => {
  pending = Math.max(0, pending - 1);
  if (pending === 0 && slowTimer) {
    clearTimeout(slowTimer);
    slowTimer = null;
  }

  if (error === undefined) {
    setStatus("ok");
  } else if (axios.isCancel(error)) {
    return;
  } else {
    setStatus(isServerUnavailableError(error) ? "unavailable" : "ok");
  }
};
