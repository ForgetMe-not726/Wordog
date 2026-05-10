export const DAILY_FOOD_CONSUMPTION = 12;
export const FULLNESS_MAX = 100;
export const MOOD_MAX = 100;

export function computeMoodChange(
  currentStreak: number,
  fullness: number,
): number {
  let change = 0;
  if (currentStreak > 0) {
    change += 5;
  }
  if (fullness <= 0) {
    change -= 10;
  }
  if (currentStreak === 0) {
    change -= 10;
  }
  return change;
}

export function computeFullnessConsumption(lastFedAt: Date): number {
  const now = new Date();
  const daysSince = Math.floor(
    (now.getTime() - lastFedAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.min(daysSince * DAILY_FOOD_CONSUMPTION, FULLNESS_MAX);
}

export function computeStreak(checkInDates: Date[]): number {
  if (checkInDates.length === 0) return 0;
  const sorted = [...checkInDates].sort(
    (a, b) => b.getTime() - a.getTime(),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const latest = new Date(sorted[0]);
  latest.setHours(0, 0, 0, 0);

  const oneDayMs = 86400000;
  if (
    latest.getTime() !== today.getTime() &&
    latest.getTime() !== today.getTime() - oneDayMs
  ) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);
    const diff = (prev.getTime() - curr.getTime()) / oneDayMs;
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export const FOOD_REWARDS: Record<string, number> = {
  learn_word: 10,
  complete_review_batch: 5,
};
