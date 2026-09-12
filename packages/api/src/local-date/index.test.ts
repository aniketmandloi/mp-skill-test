import { describe, expect, it } from "vitest";

import { resolveLocalDate } from "./index";

describe("resolveLocalDate", () => {
  it("is already tomorrow east of UTC", () => {
    expect(
      resolveLocalDate({
        timezone: "Asia/Kolkata",
        now: new Date("2026-09-12T19:00:00Z"),
      }),
    ).toBe("2026-09-13");
  });

  it("falls back to UTC when the user has no timezone", () => {
    expect(
      resolveLocalDate({ timezone: null, now: new Date("2026-09-12T19:00:00Z") }),
    ).toBe("2026-09-12");
  });

  it("falls back to UTC when the stored timezone is not a real zone", () => {
    expect(
      resolveLocalDate({ timezone: "Mars/Olympus", now: new Date("2026-09-12T19:00:00Z") }),
    ).toBe("2026-09-12");
  });
});
