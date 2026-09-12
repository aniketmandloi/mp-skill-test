import { describe, expect, it } from "vitest";

import { t } from "../index";
import type { Context } from "../context";
import { appRouter } from "./index";

const createCaller = t.createCallerFactory(appRouter);

describe("healthCheck", () => {
  it("reports OK without a session", async () => {
    const caller = createCaller({ session: null } as Context);

    await expect(caller.healthCheck()).resolves.toBe("OK");
  });
});
