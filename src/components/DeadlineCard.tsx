import { useState, useEffect } from "react";
import { Deadline } from "@/types/study";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface DeadlineCardProps {
  deadline: Deadline;
  onRemove: (id: string) => void;
}

const colorClasses = {
  purple: "gradient-purple glow-purple",
  orange: "gradient-orange glow-orange",
  cyan: "gradient-cyan glow-cyan",
  pink: "gradient-pink",
};

export function DeadlineCard({ deadline, onRemove }: DeadlineCardProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(deadline.dueDate));

  function getTimeLeft(dueDate: Date) {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, overdue: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, overdue: false };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(deadline.dueDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline.dueDate]);

  return (
    <div className={`relative p-4 rounded-2xl ${colorClasses[deadline.color]} animate-slide-up`}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
        onClick={() => onRemove(deadline.id)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <p className="text-[10px] font-medium uppercase tracking-wider text-primary-foreground/70 mb-0.5">
        {deadline.className}
      </p>
      <h3 className="font-display text-sm font-semibold text-primary-foreground mb-3">
        {deadline.title}
      </h3>
      
      {timeLeft.overdue ? (
        <p className="text-sm font-medium text-primary-foreground animate-pulse-glow">
          Overdue!
        </p>
      ) : (
        <div className="flex gap-2">
          <TimeUnit value={timeLeft.days} label="d" />
          <TimeUnit value={timeLeft.hours} label="h" />
          <TimeUnit value={timeLeft.minutes} label="m" />
          <TimeUnit value={timeLeft.seconds} label="s" />
        </div>
      )}
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-lg px-2 py-1">
        <span className="font-display text-base font-bold text-primary-foreground">
          {value.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] text-primary-foreground/70 ml-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}
