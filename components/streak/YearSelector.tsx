'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface YearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  years: number[];
}

export function YearSelector({ selectedYear, onYearChange, years }: YearSelectorProps) {
  return (
    <Select
      value={selectedYear.toString()}
      onValueChange={(value) => onYearChange(parseInt(value, 10))}
    >
      <SelectTrigger className="w-24 bg-zinc-800 border-zinc-700 text-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-zinc-900 border-zinc-800">
        {years.map((year) => (
          <SelectItem
            key={year}
            value={year.toString()}
            className={cn(
              'cursor-pointer focus:bg-zinc-800',
              year === selectedYear && 'bg-zinc-800'
            )}
          >
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
