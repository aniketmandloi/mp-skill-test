import { weekdayOf } from "../local-date/index";

export type ComputeStreakInput = {
  scheduleDays: number[];
  checkInDates: string[];
  today: string;
};


const DAY_MS = 86_400_000;

const asDate = (localDate: string) => new Date(`${localDate}T12:00:00Z`);

const dayBefore = (localDate: string) =>
  new Date(asDate(localDate).getTime() - DAY_MS).toISOString().slice(0, 10);

export const computeStreak = ({ scheduleDays, checkInDates, today }: ComputeStreakInput) => {
  const checkedIn = new Set(checkInDates);
  // Nothing before the first check-in can extend a streak, so the walk stops there.
  const earliest = checkInDates.reduce((a, b) => (a < b ? a : b), today);
  let streak = 0;
  let cursor = today;

  while (cursor >= earliest) {
    if (scheduleDays.includes(weekdayOf(cursor))) {
      if (!checkedIn.has(cursor)) {
        // Today is not over in the user's timezone yet, so it cannot be a missed day.
        if (cursor !== today) break;
      } else {
        streak += 1;
      }
    }
    cursor = dayBefore(cursor);
  }

  return streak;
};
