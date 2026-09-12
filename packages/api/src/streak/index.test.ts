import { describe, expect, it } from "vitest";

import { computeStreak } from "./index";

const MON_WED_FRI = [1, 3, 5];

describe("computeStreak", () => {
  it("counts consecutive scheduled days that were checked in", () => {
    expect(
      computeStreak({
        scheduleDays: MON_WED_FRI,
        checkInDates: ["2026-09-07", "2026-09-09", "2026-09-11"],
        today: "2026-09-11",
      }),
    ).toBe(3);
  });

  it("leaves the streak intact while today is still in progress", () => {
    expect(
      computeStreak({
        scheduleDays: MON_WED_FRI,
        checkInDates: ["2026-09-07", "2026-09-09"],
        today: "2026-09-11",
      }),
    ).toBe(2);
  });

  it("is zero for a habit with no scheduled days", { timeout: 1000 }, () => {
    expect(
      computeStreak({
        scheduleDays: [],
        checkInDates: [],
        today: "2026-09-11",
      }),
    ).toBe(0);
  });
});
