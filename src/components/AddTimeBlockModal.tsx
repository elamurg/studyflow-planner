import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Plus, Clock } from "lucide-react";
import { TimeBlock } from "@/types/study";

interface AddTimeBlockModalProps {
  onAdd: (block: Omit<TimeBlock, "id">) => void;
  editBlock?: TimeBlock | null;
  onUpdate?: (block: TimeBlock) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const colorOptions: {
  value: "purple" | "orange" | "cyan" | "pink";
  label: string;
  className: string;
}[] = [
  { value: "purple", label: "Purple", className: "bg-primary" },
  { value: "orange", label: "Orange", className: "bg-accent" },
  { value: "cyan", label: "Cyan", className: "bg-cyan-500" },
  { value: "pink", label: "Pink", className: "bg-pink-500" },
];

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const HOURS = Array.from({ length: 16 }, (_, i) => ({
  value: i + 6,
  label:
    i + 6 === 0
      ? "12 AM"
      : i + 6 < 12
      ? `${i + 6} AM`
      : i + 6 === 12
      ? "12 PM"
      : `${i + 6 - 12} PM`,
}));

export function AddTimeBlockModal({
  onAdd,
  editBlock,
  onUpdate,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddTimeBlockModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [day, setDay] = useState(new Date().getDay());
  const [startHour, setStartHour] = useState(9);
  const [color, setColor] = useState<"purple" | "orange" | "cyan" | "pink">(
    "purple"
  );

  useEffect(() => {
    if (editBlock) {
      setTitle(editBlock.title);
      setDescription(editBlock.description);
      setDuration(editBlock.duration.toString());
      setDay(editBlock.day);
      setStartHour(editBlock.startHour);
      setColor(editBlock.color);
    } else {
      resetForm();
    }
  }, [editBlock]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDuration("30");
    setDay(new Date().getDay());
    setStartHour(9);
    setColor("purple");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const durationNum = parseInt(duration) || 30;

    if (editBlock && onUpdate) {
      onUpdate({
        ...editBlock,
        title: title.trim(),
        description: description.trim(),
        duration: Math.min(Math.max(durationNum, 15), 480),
        day,
        startHour,
        color,
      });
    } else {
      onAdd({
        title: title.trim(),
        description: description.trim(),
        duration: Math.min(Math.max(durationNum, 15), 480),
        day,
        startHour,
        color,
        completed: false,
      });
    }

    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlledOpen && (
        <DialogTrigger asChild>
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {editBlock ? "Edit Task" : "New Time Block"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Name</Label>
            <Input
              id="title"
              placeholder="What do you need to do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary/50 border-border/50"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-secondary/50 border-border/50 min-h-[60px] resize-none"
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="480"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startHour">Start Time</Label>
              <select
                id="startHour"
                value={startHour}
                onChange={(e) => setStartHour(parseInt(e.target.value))}
                className="flex h-10 w-full rounded-xl border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {HOURS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="day">Day</Label>
            <select
              id="day"
              value={day}
              onChange={(e) => setDay(parseInt(e.target.value))}
              className="flex h-10 w-full rounded-xl border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {DAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={`w-10 h-10 rounded-xl ${option.className} transition-all ${
                    color === option.value
                      ? "ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110"
                      : "opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <Button type="submit" variant="gradient" className="w-full">
            {editBlock ? "Update Task" : "Create Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
