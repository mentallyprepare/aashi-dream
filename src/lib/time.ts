const APP_TIME_ZONE = "Asia/Kolkata";

export function todayInputDateIst(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

export function formatIstDate(value: unknown) {
  const raw = String(value ?? "");
  if (/^\d{4}-\d{2}$/.test(raw)) {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: APP_TIME_ZONE,
      month: "short",
      year: "numeric",
    }).format(new Date(`${raw}-01T00:00:00+05:30`));
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: APP_TIME_ZONE,
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(`${raw.slice(0, 10)}T00:00:00+05:30`));
  }
  return raw;
}

export function formatIstDateTime(value: string | Date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: APP_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
