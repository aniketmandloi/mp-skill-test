import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

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

export const habitRelations = relations(habit, ({ one }) => ({
  user: one(user, {
    fields: [habit.userId],
    references: [user.id],
  }),
}));
