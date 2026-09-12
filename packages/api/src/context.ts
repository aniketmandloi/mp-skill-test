import type { createAuth } from "@mp-skill-test/auth";
import type { Database } from "@mp-skill-test/db";

export type Context = {
  auth: null;
  session: Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>;
  db: Database;
};
