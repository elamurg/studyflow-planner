import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, BookOpen } from "lucide-react";
import { ClassSubject } from "@/types/study";

interface AddClassModalProps {
  onAdd: (classSubject: Omit<ClassSubject, 'id' | 'tasks'>) => void;
}

const colorOptions: { value: 'purple' | 'orange' | 'cyan' | 'pink'; label: string; className: string }[] = [
  { value: 'purple', label: 'Purple', className: 'bg-primary' },
  { value: 'orange', label: 'Orange', className: 'bg-accent' },
  { value: 'cyan', label: 'Cyan', className: 'bg-cyan-400' },
  { value: 'pink', label: 'Pink', className: 'bg-pink-400' },
];

export function AddClassModal({ onAdd }: AddClassModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState<'purple' | 'orange' | 'cyan' | 'pink'>('purple');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      color,
    });

    setName("");
    setColor('purple');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Class
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            New Class
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              placeholder="e.g., Mathematics, History..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/50 border-border/50"
            />
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
                      ? 'ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
          <Button type="submit" variant="gradientOrange" className="w-full">
            Create Class
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
