# Habit Tracking

The domain of this app: people commit to doing something on particular days of the week, record whether they did it, and see how long they've kept it up.

## Language

**Habit**:
A recurring commitment belonging to one user, made up of a name and the weekdays it is meant to be done on.
_Avoid_: Goal, task, routine, todo

**Scheduled Day**:
A weekday a habit is meant to be done on. A day that is not scheduled carries no obligation, so nothing that happens (or doesn't) on it can affect a streak.
_Avoid_: Due date, target day, active day

**Check-In**:
The record that a habit was done on one local date. Binary: a check-in either exists or it doesn't, with no degree or quantity.
_Avoid_: Completion, entry, log, tick, event

**Local Date**:
The calendar date in the user's timezone. The only notion of "day" in this domain: every check-in is stamped with one, and the boundary between one day and the next is the user's midnight, not UTC's.
_Avoid_: Today, date, timestamp

**Streak**:
The number of consecutive scheduled days, counting back from the current local date, on which a habit was checked in. Always derived from the check-in record and the habit's schedule, never stored.
_Avoid_: Run, chain, count, score

**Missed Day**:
A scheduled day that has ended in the user's timezone with no check-in. A scheduled day still in progress is not missed, so a streak survives until the user's midnight.
_Avoid_: Failure, break, skip, lapse
