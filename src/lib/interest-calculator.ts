import { INTEREST_SIGNALS } from "./constants";

export function calculateInterestDelta(signals: string[]): number {
  return signals.reduce((sum, signal) => {
    const config = INTEREST_SIGNALS[signal];
    return sum + (config?.score ?? 0);
  }, 0);
}

export function recalculateScore(
  currentScore: number,
  signals: string[]
): number {
  const delta = calculateInterestDelta(signals);
  return Math.max(0, currentScore + delta);
}
