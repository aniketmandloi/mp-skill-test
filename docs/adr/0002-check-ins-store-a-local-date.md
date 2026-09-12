# Check-ins store a resolved local date, not a timestamp

A check-in is stored as a `date` holding the user's local date, resolved from their timezone at write time, rather than as a `timestamptz` of the moment they tapped the button.

The timezone question gets answered once, at the edge, when the row is written. Everything downstream — the streak calculation, the unique constraint of one check-in per habit per day, the UI — compares plain calendar dates and never converts anything. Storing an instant instead would push a timezone conversion into every read and make the same row mean different days to different readers.

## Consequences

We lose the instant a habit was checked in; if that's ever wanted (a "you usually do this in the morning" insight), it's an additional column, not a change to this one. A user who changes timezone keeps their existing check-ins as-is, which is the intended behaviour: the day they recorded is the day they lived.
