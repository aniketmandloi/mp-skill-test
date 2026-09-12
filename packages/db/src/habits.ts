import { and, asc, eq } from "drizzle-orm";

import type { Database } from "./index";
import { habit } from "./schema/habit";

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
