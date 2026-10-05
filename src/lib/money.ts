export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatMoneyShort(cents: number): string {
  return `$${Math.round(cents / 100)}`;
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Kralendijk",
  }).format(typeof value === "string" ? new Date(value) : value);
}

export function formatDay(value: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "America/Kralendijk",
  }).format(typeof value === "string" ? new Date(value) : value);
}

export function percent(value: number): string {
  return `${Math.round(value)}%`;
}
