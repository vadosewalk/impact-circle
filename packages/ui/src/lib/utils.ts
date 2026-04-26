import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDisplayNameInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";

  const firstPart = parts[0];
  if (!firstPart) return "?";

  if (parts.length === 1) {
    return firstPart.slice(0, 2).toUpperCase();
  }

  const lastPart = parts[parts.length - 1];

  const first = firstPart[0] ?? "";
  const last = lastPart ? (lastPart[0] ?? "") : "";
  return (first + last).toUpperCase();
}
