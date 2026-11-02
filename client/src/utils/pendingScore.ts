export interface PendingScore {
  score: number;
  duration_seconds: number;
}

export const readPendingScore = (): PendingScore | null => {
  const stored = localStorage.getItem("pendingScore");
  if (!stored) return null;
  try {
    const result = JSON.parse(stored);
    if (
      result && typeof result === "object" &&
      Number.isInteger(result.score) && result.score > 0 &&
      [15, 30, 60].includes(result.duration_seconds)
    ) return result;
  } catch {
    // Old or malformed pending results cannot be assigned a duration reliably.
  }
  localStorage.removeItem("pendingScore");
  return null;
};
