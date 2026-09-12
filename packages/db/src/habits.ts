import { and, asc, eq, inArray } from "drizzle-orm";

import type { Database } from "./index";
import { checkIn, habit } from "./schema/habit";

export type NewHabit = {
  userId: string;
  name: string;
  scheduleDays: number[];
};

export function listHabits(db: Database, userId: string) {
  return db.select().from(habit).where(eq(habit.userId, userId)).orderBy(asc(habit.createdAt));
}

export async function createHabit(db: Database, { userId, name, scheduleDays }: NewHabit) {
  const [created] = await db
    .insert(habit)
    .values({ id: crypto.randomUUID(), userId, name, scheduleDays })
    .returning();

  return created;
}

export async function deleteHabit(db: Database, { id, userId }: { id: string; userId: string }) {
  const [deleted] = await db
    .delete(habit)
    .where(and(eq(habit.id, id), eq(habit.userId, userId)))
    .returning({ id: habit.id });

  return deleted;
}

/** Every habit the user owns, each with the local dates it was checked in on. */
export async function listHabitsWithCheckIns(db: Database, userId: string) {
  const habits = await listHabits(db, userId);

  if (habits.length === 0) {
    return [];
  }

  const checkIns = await db
    .select({ habitId: checkIn.habitId, date: checkIn.date })
    .from(checkIn)
    .where(
      inArray(
        checkIn.habitId,
        habits.map(({ id }) => id),
      ),
    );

  const datesByHabit = new Map<string, string[]>();
  for (const row of checkIns) {
    const dates = datesByHabit.get(row.habitId) ?? [];
    dates.push(row.date);
    datesByHabit.set(row.habitId, dates);
  }

  return habits.map((habitRow) => ({
    ...habitRow,
    checkInDates: datesByHabit.get(habitRow.id) ?? [],
  }));
}

/**
 * Adds or removes the check-in for one local date, returning whether the habit
 * is checked in afterwards. Returns null when the habit is not the user's.
 */
export function toggleCheckIn(
  db: Database,
  { habitId, userId, localDate }: { habitId: string; userId: string; localDate: string },
) {
  // One transaction: two taps racing must not both see "not checked in" and
  // collide on the unique index.
  return db.transaction(async (tx) => {
    const [owned] = await tx
      .select({ id: habit.id })
      .from(habit)
      .where(and(eq(habit.id, habitId), eq(habit.userId, userId)))
      .for("update");

    if (!owned) {
      return null;
    }

    const [removed] = await tx
      .delete(checkIn)
      .where(and(eq(checkIn.habitId, habitId), eq(checkIn.date, localDate)))
      .returning({ id: checkIn.id });

    if (removed) {
      return { checkedIn: false };
    }

    await tx.insert(checkIn).values({ id: crypto.randomUUID(), habitId, date: localDate });

    return { checkedIn: true };
  });
}

export async function updateHabitSchedule(
  db: Database,
  { id, userId, scheduleDays }: { id: string; userId: string; scheduleDays: number[] },
) {
  const [updated] = await db
    .update(habit)
    .set({ scheduleDays })
    .where(and(eq(habit.id, id), eq(habit.userId, userId)))
    .returning();

  return updated;
}
