/**
 * Joins conditional class names. Deliberately dependency-free — we don't ship
 * conflicting Tailwind classes for the same property, so full `tailwind-merge`
 * resolution isn't needed yet.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function dayLabel(date: Date): string {
  return DAY_LABELS[date.getDay()];
}

export function twoDigit(value: number): string {
  return String(value).padStart(2, "0");
}
