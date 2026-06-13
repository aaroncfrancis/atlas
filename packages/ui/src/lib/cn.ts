export type ClassValue = string | number | null | false | undefined;

/** Tiny className joiner (drops falsy values). Keeps the UI package dep-free. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
