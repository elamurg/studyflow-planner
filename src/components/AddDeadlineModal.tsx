import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, Calendar } from "lucide-react";
import { Deadline } from "@/types/study";

interface AddDeadlineModalProps {
  classes: { id: string; name: string; color: 'purple' | 'orange' | 'cyan' | 'pink' }[];
  onAdd: (deadline: Omit<Deadline, 'id'>) => void;
}

export function AddDeadlineModal({ classes, onAdd }: AddDeadlineModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || "");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || !selectedClass) return;

    const classData = classes.find((c) => c.id === selectedClass);
    if (!classData) return;

    onAdd({
      title: title.trim(),
      className: classData.name,
      dueDate: new Date(dueDate),
      color: classData.color,
    });

    setTitle("");
    setDueDate("");
    setSelectedClass(classes[0]?.id || "");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Deadline
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            New Deadline
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Assignment name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date & Time</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
          </div>
          <Button type="submit" variant="gradient" className="w-full">
            Create Deadline
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
