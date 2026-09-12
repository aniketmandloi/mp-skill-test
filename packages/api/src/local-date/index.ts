export type ResolveLocalDateInput = {
  timezone: string | null;
  now?: Date;
};

function formatterFor(timezone: string | null) {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  } as const;

  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone ?? "UTC", ...options });
  } catch {
    // A user row can predate timezone capture, or hold a zone this runtime doesn't know.
    return new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", ...options });
  }
}

export function resolveLocalDate({ timezone, now = new Date() }: ResolveLocalDateInput) {
  return formatterFor(timezone).format(now);
}
