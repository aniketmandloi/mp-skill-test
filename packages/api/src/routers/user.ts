import { setUserTimezone } from "@mp-skill-test/db/users";
import z from "zod";

import { protectedProcedure, router } from "../index";

function isKnownTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export const userRouter = router({
  setTimezone: protectedProcedure
    .input(z.object({ timezone: z.string().refine(isKnownTimezone, "Unknown timezone") }))
    .mutation(({ ctx, input }) => setUserTimezone(ctx.db, ctx.session.user.id, input.timezone)),
});
