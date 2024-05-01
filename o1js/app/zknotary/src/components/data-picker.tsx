"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ControllerRenderProps } from "react-hook-form";

type FormControllerUntilProps = ControllerRenderProps<
  {
    username: string;
    repo: string;
    since: Date;
    until: Date;
  },
  "until"
>;

type FormControllerSinceProps = ControllerRenderProps<
  {
    username: string;
    repo: string;
    since: Date;
    until: Date;
  },
  "since"
>;

export function DatePicker({
  ...props
}: FormControllerSinceProps | FormControllerUntilProps) {
  const [date, setDate] = React.useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          {...props}
        />
      </PopoverContent>
    </Popover>
  );
}
