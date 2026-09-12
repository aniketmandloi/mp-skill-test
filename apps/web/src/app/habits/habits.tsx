"use client";

import { Button } from "@mp-skill-test/ui/components/button";
import { Card, CardContent } from "@mp-skill-test/ui/components/card";
import { Checkbox } from "@mp-skill-test/ui/components/checkbox";
import { Empty, EmptyDescription, EmptyTitle } from "@mp-skill-test/ui/components/empty";
import { Input } from "@mp-skill-test/ui/components/input";
import { Label } from "@mp-skill-test/ui/components/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { trpc } from "@/utils/trpc";

const WEEKDAYS = [
  { day: 1, label: "Mon" },
  { day: 2, label: "Tue" },
  { day: 3, label: "Wed" },
  { day: 4, label: "Thu" },
  { day: 5, label: "Fri" },
  { day: 6, label: "Sat" },
  { day: 0, label: "Sun" },
] as const;

export default function Habits({ storedTimezone }: { storedTimezone: string | null }) {
  const queryClient = useQueryClient();
  const habits = useQuery(trpc.habit.list.queryOptions());
  const today = useQuery(trpc.habit.today.queryOptions());

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.habit.list.queryKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.habit.today.queryKey() }),
    ]);
  };

  const setTimezone = useMutation(
    trpc.user.setTimezone.mutationOptions({ onSuccess: () => void invalidate() }),
  );

  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (browserTimezone && browserTimezone !== storedTimezone) {
      setTimezone.mutate({ timezone: browserTimezone });
    }
    // Reporting once per mount is enough; the mutation is deliberately not a dependency.
  }, [storedTimezone]);

  const [name, setName] = useState("");
  const [scheduleDays, setScheduleDays] = useState<number[]>([]);

  const create = useMutation(
    trpc.habit.create.mutationOptions({
      onSuccess: () => {
        setName("");
        setScheduleDays([]);
        void invalidate();
      },
    }),
  );

  const remove = useMutation(
    trpc.habit.delete.mutationOptions({ onSuccess: () => void invalidate() }),
  );

  const toggleCheckIn = useMutation(
    trpc.habit.toggleCheckIn.mutationOptions({ onSuccess: () => void invalidate() }),
  );

  const updateSchedule = useMutation(
    trpc.habit.updateSchedule.mutationOptions({ onSuccess: () => void invalidate() }),
  );

  const rescheduleHabit = (habitId: string, scheduleDays: number[], day: number) => {
    const next = scheduleDays.includes(day)
      ? scheduleDays.filter((d) => d !== day)
      : [...scheduleDays, day];

    // A habit with no scheduled days would never come round again.
    if (next.length === 0) {
      return;
    }

    updateSchedule.mutate({ id: habitId, scheduleDays: next });
  };

  const toggleDay = (day: number) =>
    setScheduleDays((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
    );

  const canSubmit = name.trim().length > 0 && scheduleDays.length > 0 && !create.isPending;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Habits</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Today</h2>
        {today.data?.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nothing scheduled for today.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {today.data?.map((habit) => (
              <li
                key={habit.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <Label className="flex items-center gap-3 font-normal">
                  <Checkbox
                    checked={habit.checkedIn}
                    disabled={toggleCheckIn.isPending}
                    onCheckedChange={() => toggleCheckIn.mutate({ habitId: habit.id })}
                  />
                  <span className={habit.checkedIn ? "text-muted-foreground line-through" : ""}>
                    {habit.name}
                  </span>
                </Label>
                <span className="text-sm tabular-nums">
                  {habit.streak === 0
                    ? "No streak"
                    : `${habit.streak} day${habit.streak === 1 ? "" : "s"}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Stretch for ten minutes"
            />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Scheduled days</legend>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(({ day, label }) => (
                <Button
                  key={day}
                  type="button"
                  variant={scheduleDays.includes(day) ? "default" : "outline"}
                  size="sm"
                  aria-pressed={scheduleDays.includes(day)}
                  onClick={() => toggleDay(day)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </fieldset>

          <Button
            disabled={!canSubmit}
            onClick={() => create.mutate({ name, scheduleDays })}
            className="self-start"
          >
            Add habit
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-medium">All habits</h2>

      {habits.data?.length === 0 ? (
        <Empty>
          <EmptyTitle>No habits yet</EmptyTitle>
          <EmptyDescription>Add one above to start tracking it.</EmptyDescription>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-2">
          {habits.data?.map((habit) => (
            <li
              key={habit.id}
              className="flex items-center justify-between rounded-md border px-4 py-3"
            >
              <div className="flex flex-col gap-2">
                <span className="font-medium">{habit.name}</span>
                <div className="flex flex-wrap gap-1">
                  {WEEKDAYS.map(({ day, label }) => (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      variant={habit.scheduleDays.includes(day) ? "default" : "outline"}
                      aria-pressed={habit.scheduleDays.includes(day)}
                      disabled={updateSchedule.isPending}
                      onClick={() => rescheduleHabit(habit.id, habit.scheduleDays, day)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={remove.isPending}
                onClick={() => remove.mutate({ id: habit.id })}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
