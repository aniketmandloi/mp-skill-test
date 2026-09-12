import { eq } from "drizzle-orm";

import type { Database } from "./index";
import { user } from "./schema/auth";

export async function setUserTimezone(db: Database, userId: string, timezone: string) {
  const [updated] = await db
    .update(user)
    .set({ timezone })
    .where(eq(user.id, userId))
    .returning({ timezone: user.timezone });

  return updated;
}
