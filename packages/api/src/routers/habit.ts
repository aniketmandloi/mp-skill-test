import {
  createHabit,
  deleteHabit,
  listHabits,
  listHabitsWithCheckIns,
  toggleCheckIn,
  updateHabitSchedule,
} from "@mp-skill-test/db/habits";
import { TRPCError } from "@trpc/server";
import z from "zod";

import { protectedProcedure, router } from "../index";
import { resolveLocalDate } from "../local-date/index";
import { computeStreak } from "../streak/index";

const weekday = z.number().int().min(0).max(6);

const habitInput = z.object({
  name: z.string().trim().min(1).max(100),
  scheduleDays: z
    .array(weekday)
    .min(1, "A habit needs at least one scheduled day")
    .transform((days) => [...new Set(days)].sort((a, b) => a - b)),
});

export const habitRouter = router({
  list: protectedProcedure.query(({ ctx }) => listHabits(ctx.db, ctx.session.user.id)),

  /** The habits scheduled for the user's today, each with its streak. */
  today: protectedProcedure.query(async ({ ctx }) => {
    const today = resolveLocalDate({ timezone: ctx.session.user.timezone });
    const weekdayToday = new Date(`${today}T12:00:00Z`).getUTCDay();
    const habits = await listHabitsWithCheckIns(ctx.db, ctx.session.user.id);

    return habits
      .filter((entry) => entry.scheduleDays.includes(weekdayToday))
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        scheduleDays: entry.scheduleDays,
        checkedIn: entry.checkInDates.includes(today),
        streak: computeStreak({
          scheduleDays: entry.scheduleDays,
          checkInDates: entry.checkInDates,
          today,
        }),
      }));
  }),

  toggleCheckIn: protectedProcedure
    .input(z.object({ habitId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const toggled = await toggleCheckIn(ctx.db, {
        habitId: input.habitId,
        userId: ctx.session.user.id,
        date: resolveLocalDate({ timezone: ctx.session.user.timezone }),
      });

      if (!toggled) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Habit not found" });
      }

      return toggled;
    }),

  create: protectedProcedure.input(habitInput).mutation(({ ctx, input }) =>
    createHabit(ctx.db, {
      userId: ctx.session.user.id,
      name: input.name,
      scheduleDays: input.scheduleDays,
    }),
  ),

  updateSchedule: protectedProcedure
    .input(z.object({ id: z.string(), scheduleDays: habitInput.shape.scheduleDays }))
    .mutation(async ({ ctx, input }) => {
      const updated = await updateHabitSchedule(ctx.db, {
        id: input.id,
        userId: ctx.session.user.id,
        scheduleDays: input.scheduleDays,
      });

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Habit not found" });
      }

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await deleteHabit(ctx.db, { id: input.id, userId: ctx.session.user.id });

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Habit not found" });
      }

      return deleted;
    }),
});
