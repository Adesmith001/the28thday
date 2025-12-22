'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({ date, onDateChange, placeholder = 'Pick a date', disabled }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const currentYear = new Date().getFullYear();
  const fromYear = 1900;
  const toYear = currentYear;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
          <ChevronDownIcon className="ml-auto h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          onSelect={(selected) => {
            onDateChange(selected);
            if (selected) setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
