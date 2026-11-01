"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, Check, Loader2, Sparkles } from "lucide-react";
import { saveAvailabilitySlotsAction } from "@/modules/providers/actions";

interface SlotItem {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

interface AvailabilityEditorProps {
  initialSlots: SlotItem[];
}

const DAYS = [
  { index: 1, name: "Monday", short: "Mon" },
  { index: 2, name: "Tuesday", short: "Tue" },
  { index: 3, name: "Wednesday", short: "Wed" },
  { index: 4, name: "Thursday", short: "Thu" },
  { index: 5, name: "Friday", short: "Fri" },
  { index: 6, name: "Saturday", short: "Sat" },
  { index: 0, name: "Sunday", short: "Sun" },
];

const STANDARD_SLOTS = [
  { startTime: "09:00 AM", endTime: "11:00 AM", label: "Morning" },
  { startTime: "11:30 AM", endTime: "01:30 PM", label: "Midday" },
  { startTime: "02:30 PM", endTime: "04:30 PM", label: "Afternoon" },
  { startTime: "05:00 PM", endTime: "07:00 PM", label: "Evening" },
];

export function AvailabilityEditor({ initialSlots }: AvailabilityEditorProps) {
  const [slots, setSlots] = useState<SlotItem[]>(initialSlots);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if a slot is currently active
  const isSlotActive = (dayOfWeek: number, startTime: string) => {
    return slots.some((s) => s.dayOfWeek === dayOfWeek && s.startTime === startTime);
  };

  // Toggle individual slot
  const toggleSlot = (dayOfWeek: number, startTime: string, endTime: string) => {
    setSaveSuccess(false);
    if (isSlotActive(dayOfWeek, startTime)) {
      setSlots((prev) =>
        prev.filter((s) => !(s.dayOfWeek === dayOfWeek && s.startTime === startTime))
      );
    } else {
      setSlots((prev) => [...prev, { dayOfWeek, startTime, endTime, isBooked: false }]);
    }
  };

  // Toggle entire day
  const toggleEntireDay = (dayOfWeek: number) => {
    setSaveSuccess(false);
    const daySlotsActive = STANDARD_SLOTS.every((s) => isSlotActive(dayOfWeek, s.startTime));
    if (daySlotsActive) {
      // Remove all slots for this day
      setSlots((prev) => prev.filter((s) => s.dayOfWeek !== dayOfWeek));
    } else {
      // Add all standard slots for this day
      const remainingSlots = slots.filter((s) => s.dayOfWeek !== dayOfWeek);
      const newDaySlots = STANDARD_SLOTS.map((s) => ({
        dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isBooked: false,
      }));
      setSlots([...remainingSlots, ...newDaySlots]);
    }
  };

  // Preset: Mon - Sat full day
  const applyPresetMonSat = () => {
    setSaveSuccess(false);
    const newSlots: SlotItem[] = [];
    [1, 2, 3, 4, 5, 6].forEach((day) => {
      STANDARD_SLOTS.forEach((slot) => {
        newSlots.push({
          dayOfWeek: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: false,
        });
      });
    });
    setSlots(newSlots);
  };

  // Preset: Mon - Fri
  const applyPresetWeekdays = () => {
    setSaveSuccess(false);
    const newSlots: SlotItem[] = [];
    [1, 2, 3, 4, 5].forEach((day) => {
      STANDARD_SLOTS.forEach((slot) => {
        newSlots.push({
          dayOfWeek: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: false,
        });
      });
    });
    setSlots(newSlots);
  };

  const handleSave = () => {
    setError(null);
    setSaveSuccess(false);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("slots", JSON.stringify(slots));
      const res = await saveAvailabilitySlotsAction(formData);
      if (res.success) {
        setSaveSuccess(true);
      } else {
        setError(res.error || "Failed to save availability schedule.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Presets */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm flex items-center gap-1.5 text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              Quick Schedule Presets
            </h3>
            <p className="text-xs text-muted-foreground">
              Select standard working shifts or customize slot by slot. Currently active:{" "}
              <span className="font-semibold text-foreground">{slots.length} time slots</span> across the week.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={applyPresetMonSat} className="text-xs">
              Mon - Sat (All Day)
            </Button>
            <Button size="sm" variant="outline" onClick={applyPresetWeekdays} className="text-xs">
              Mon - Fri Only
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSlots([])}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Days Matrix */}
      <div className="space-y-4">
        {DAYS.map((day) => {
          const activeCountInDay = STANDARD_SLOTS.filter((s) => isSlotActive(day.index, s.startTime)).length;
          const isFullDay = activeCountInDay === STANDARD_SLOTS.length;

          return (
            <Card key={day.index} className="overflow-hidden">
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                    {day.short}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{day.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {activeCountInDay > 0
                        ? `${activeCountInDay} of ${STANDARD_SLOTS.length} slots active`
                        : "Day Off / Inactive"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isFullDay ? "secondary" : "outline"}
                    onClick={() => toggleEntireDay(day.index)}
                    className="text-xs h-8"
                  >
                    {isFullDay ? "Disable Day" : "Enable All Slots"}
                  </Button>
                </div>
              </div>

              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STANDARD_SLOTS.map((slot) => {
                  const active = isSlotActive(day.index, slot.startTime);
                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      onClick={() => toggleSlot(day.index, slot.startTime, slot.endTime)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        active
                          ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/40"
                          : "border-border/60 bg-card hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider block opacity-70">
                          {slot.label}
                        </span>
                        {active && <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />}
                      </div>
                      <div className="font-semibold text-xs mt-1 text-foreground">
                        {slot.startTime}
                      </div>
                      <div className="text-[11px] text-muted-foreground">to {slot.endTime}</div>
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Save Action Bar */}
      <div className="sticky bottom-4 bg-card/95 backdrop-blur border rounded-xl p-4 shadow-lg flex items-center justify-between gap-4">
        <div>
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Schedule updated and synced with customer search!
            </span>
          )}
          {error && <span className="text-xs font-semibold text-destructive">{error}</span>}
          {!saveSuccess && !error && (
            <span className="text-xs text-muted-foreground">
              Total active slots: <strong>{slots.length}</strong>. Customers will only see open slots.
            </span>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={isPending}
          variant="brand"
          className="gap-2 shadow-md"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CalendarIcon className="w-4 h-4" />
          )}
          <span>Save Availability</span>
        </Button>
      </div>
    </div>
  );
}
