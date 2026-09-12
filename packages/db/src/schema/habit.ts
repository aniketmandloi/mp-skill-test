import { relations } from "drizzle-orm";
import { date, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const habit = pgTable(
  "habit",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // Weekday numbers, 0 = Sunday, matching Date#getUTCDay.
    scheduleDays: integer("schedule_days").array().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("habit_userId_idx").on(table.userId)],
);

export const checkIn = pgTable(
  "check_in",
  {
    id: text("id").primaryKey(),
    habitId: text("habit_id")
      .notNull()
      .references(() => habit.id, { onDelete: "cascade" }),
    // The user's local date, already resolved from their timezone (ADR-0002).
    date: date("date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("check_in_habit_date_idx").on(table.habitId, table.date)],
);

export const habitRelations = relations(habit, ({ one, many }) => ({
  user: one(user, {
    fields: [habit.userId],
    references: [user.id],
  }),
  checkIns: many(checkIn),
}));

export const checkInRelations = relations(checkIn, ({ one }) => ({
  habit: one(habit, {
    fields: [checkIn.habitId],
    references: [habit.id],
  }),
}));
