"use client";

import { Button } from "@mp-skill-test/ui/components/button";
import { Card, CardContent } from "@mp-skill-test/ui/components/card";
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

  const setTimezone = useMutation(trpc.user.setTimezone.mutationOptions());

  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (browserTimezone && browserTimezone !== storedTimezone) {
      setTimezone.mutate({ timezone: browserTimezone });
    }
    // Reporting once per mount is enough; the mutation is deliberately not a dependency.
  }, [storedTimezone]);

  const [name, setName] = useState("");
  const [scheduleDays, setScheduleDays] = useState<number[]>([]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.habit.list.queryKey() });

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

  const toggleDay = (day: number) =>
    setScheduleDays((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
    );

  const canSubmit = name.trim().length > 0 && scheduleDays.length > 0 && !create.isPending;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Habits</h1>

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
              <div className="flex flex-col">
                <span className="font-medium">{habit.name}</span>
                <span className="text-muted-foreground text-sm">
                  {WEEKDAYS.filter(({ day }) => habit.scheduleDays.includes(day))
                    .map(({ label }) => label)
                    .join(", ")}
                </span>
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
