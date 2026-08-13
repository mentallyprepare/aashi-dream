export const APP_TIME_ZONE = "Asia/Kolkata";

export function nowIso() {
  return new Date().toISOString();
}

export function todayInIst(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

export function isFutureOrTodayDate(value?: string | null) {
  if (!value) return false;
  return value.slice(0, 10) >= todayInIst();
}

export function dateKey(value?: string | null) {
  return value ? value.slice(0, 10) : "9999-12-31";
}

export function istDateTimeLabel(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: APP_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
