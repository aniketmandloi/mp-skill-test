import { createHabit, deleteHabit, listHabits } from "@mp-skill-test/db/habits";
import { TRPCError } from "@trpc/server";
import z from "zod";

import { protectedProcedure, router } from "../index";

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

  create: protectedProcedure.input(habitInput).mutation(({ ctx, input }) =>
    createHabit(ctx.db, {
      userId: ctx.session.user.id,
      name: input.name,
      scheduleDays: input.scheduleDays,
    }),
  ),

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
