"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type DateRangePreset = "today" | "week" | "month" | "year" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangeSelectorProps {
  value: DateRangePreset;
  customRange?: DateRange;
  onChange: (preset: DateRangePreset, customRange?: DateRange) => void;
}

export function DateRangeSelector({
  value,
  customRange,
  onChange,
}: DateRangeSelectorProps) {
  const [startDate, setStartDate] = useState(
    customRange?.start.toISOString().split("T")[0] || ""
  );
  const [endDate, setEndDate] = useState(
    customRange?.end.toISOString().split("T")[0] || ""
  );

  const handlePresetChange = (preset: DateRangePreset) => {
    onChange(preset);
  };

  const handleCustomDateChange = () => {
    if (startDate && endDate) {
      onChange("custom", {
        start: new Date(startDate),
        end: new Date(endDate),
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="date-range">Date Range</Label>
        <Select value={value} onValueChange={handlePresetChange}>
          <SelectTrigger id="date-range" className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value === "custom" && (
        <>
          <div className="flex-1 space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={handleCustomDateChange}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={handleCustomDateChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
