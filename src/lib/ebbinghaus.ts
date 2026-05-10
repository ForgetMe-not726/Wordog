export const REVIEW_INTERVALS = [0, 1, 2, 4, 7, 15, 30] as const;

export function getNextReviewStage(currentStage: number): number {
  const next = currentStage + 1;
  if (next >= REVIEW_INTERVALS.length) {
    return -1; // mastered
  }
  return next;
}

export function getNextReviewDate(stage: number): Date {
  const days = REVIEW_INTERVALS[stage];
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

export function getDueReviewsCount(
  words: { reviewStage: number; nextReviewAt: Date | null }[],
): number {
  const now = new Date();
  return words.filter((w) => {
    if (w.reviewStage === 0 || w.nextReviewAt === null) return false;
    return w.nextReviewAt <= now;
  }).length;
}
