import { ALLOWED_TRANSITIONS } from "./constants";

export function isValidTransition(from: string, to: string): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

export function getNextStatuses(currentStatus: string): string[] {
  return ALLOWED_TRANSITIONS[currentStatus] ?? [];
}
