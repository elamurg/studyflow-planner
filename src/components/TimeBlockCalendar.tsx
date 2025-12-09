import { useState } from "react";
import { TimeBlock } from "@/types/study";
import { TimeBlockItem } from "./TimeBlockItem";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

interface TimeBlockCalendarProps {
  timeBlocks: TimeBlock[];
  onMoveBlock: (id: string, newDay: number, newHour: number) => void;
  onEditBlock: (block: TimeBlock) => void;
  onDeleteBlock: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function TimeBlockCalendar({
  timeBlocks,
  onMoveBlock,
  onEditBlock,
  onDeleteBlock,
  onToggleComplete,
}: TimeBlockCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [draggedBlock, setDraggedBlock] = useState<TimeBlock | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const today = new Date();

  const handleDragStart = (block: TimeBlock) => {
    setDraggedBlock(block);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
  };

  const handleDrop = (day: number, hour: number) => {
    if (draggedBlock) {
      onMoveBlock(draggedBlock.id, day, hour);
      setDraggedBlock(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getBlocksForSlot = (day: number, hour: number) => {
    return timeBlocks.filter(
      (block) => block.day === day && block.startHour === hour
    );
  };

  const prevWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const nextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  return (
    <div className="glass-card p-4 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          {format(currentWeekStart, "MMMM yyyy")}
        </h2>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-2">
        <div />
        {weekDays.map((date, i) => (
          <div
            key={i}
            className={`text-center py-2 rounded-lg ${
              isSameDay(date, today)
                ? "gradient-purple text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            <div className="text-xs font-medium">{DAYS[i]}</div>
            <div className="text-lg font-display font-bold">
              {format(date, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="overflow-y-auto max-h-[500px] scrollbar-thin">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1">
          {HOURS.map((hour) => (
            <>
              {/* Time Label */}
              <div
                key={`label-${hour}`}
                className="text-xs text-muted-foreground text-right pr-2 py-2"
              >
                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </div>

              {/* Day Slots */}
              {weekDays.map((_, dayIndex) => {
                const blocks = getBlocksForSlot(dayIndex, hour);
                return (
                  <div
                    key={`slot-${dayIndex}-${hour}`}
                    className={`min-h-[60px] border border-border/30 rounded-lg transition-colors ${
                      draggedBlock ? "hover:bg-secondary/50 hover:border-primary/50" : ""
                    } ${isSameDay(weekDays[dayIndex], today) ? "bg-primary/5" : ""}`}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(dayIndex, hour)}
                  >
                    {blocks.map((block) => (
                      <TimeBlockItem
                        key={block.id}
                        block={block}
                        onDragStart={() => handleDragStart(block)}
                        onDragEnd={handleDragEnd}
                        onEdit={() => onEditBlock(block)}
                        onDelete={() => onDeleteBlock(block.id)}
                        onToggleComplete={() => onToggleComplete(block.id)}
                      />
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
