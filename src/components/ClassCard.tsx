import { useState } from "react";
import { ClassSubject, Task } from "@/types/study";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Trash2 } from "lucide-react";

interface ClassCardProps {
  classSubject: ClassSubject;
  onUpdateTasks: (classId: string, tasks: Task[]) => void;
}

const colorAccents = {
  purple: "border-l-4 border-l-primary",
  orange: "border-l-4 border-l-accent",
  cyan: "border-l-4 border-l-cyan-400",
  pink: "border-l-4 border-l-pink-400",
};

const progressColors = {
  purple: "gradient-purple",
  orange: "gradient-orange",
  cyan: "gradient-cyan",
  pink: "gradient-pink",
};

export function ClassCard({ classSubject, onUpdateTasks }: ClassCardProps) {
  const [newTask, setNewTask] = useState("");

  const completedTasks = classSubject.tasks.filter((t) => t.completed).length;
  const totalTasks = classSubject.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = classSubject.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    onUpdateTasks(classSubject.id, updatedTasks);
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask.trim(),
      completed: false,
    };
    onUpdateTasks(classSubject.id, [...classSubject.tasks, task]);
    setNewTask("");
  };

  const handleRemoveTask = (taskId: string) => {
    const updatedTasks = classSubject.tasks.filter((t) => t.id !== taskId);
    onUpdateTasks(classSubject.id, updatedTasks);
  };

  return (
    <div className={`glass-card p-5 ${colorAccents[classSubject.color]} animate-slide-up`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          {classSubject.name}
        </h3>
        <span className="text-sm font-medium text-muted-foreground">
          {completedTasks}/{totalTasks}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar mb-4">
        <div
          className={`progress-fill ${progressColors[classSubject.color]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {progress.toFixed(0)}% complete
      </p>

      {/* Tasks List */}
      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {classSubject.tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 group transition-colors"
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => handleToggleTask(task.id)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span
              className={`flex-1 text-sm ${
                task.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {task.title}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={() => handleRemoveTask(task.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add Task */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          className="bg-secondary/50 border-border/50 text-sm"
        />
        <Button size="icon" variant="secondary" onClick={handleAddTask}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
