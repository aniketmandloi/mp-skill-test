import { protectedProcedure, publicProcedure, router } from "../index";
import { habitRouter } from "./habit";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  habit: habitRouter,
});
export type AppRouter = typeof appRouter;
