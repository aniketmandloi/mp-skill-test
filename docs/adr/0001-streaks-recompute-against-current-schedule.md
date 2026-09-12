# Streaks recompute against the habit's current schedule

A streak is derived by walking the check-in record against the habit's schedule as it stands *now*, so editing a habit's scheduled days rewrites how its whole history reads: drop Friday from a Mon/Wed/Fri habit and every past missed Friday stops counting as a missed day, possibly reviving a streak that had been broken for months.

The alternative was to version the schedule, stamping each check-in period with the schedule in force at the time, which keeps history immutable and is what we'd build if a streak were worth money to the user. We chose recomputation because it keeps the streak a pure function of two inputs — the habit's current schedule and its check-in dates — with no schedule history to store, migrate, or reason about.

## Consequences

The streak calculation stays trivially testable and has no state of its own. The cost is a user-visible surprise: a streak can change without any check-in changing. If retroactive stability ever matters, this is the decision to revisit, and doing so means introducing schedule versioning rather than adjusting the calculation.
