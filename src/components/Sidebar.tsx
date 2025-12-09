import { Deadline, ClassSubject, Note, Task } from "@/types/study";
import { DeadlineCard } from "./DeadlineCard";
import { ClassCard } from "./ClassCard";
import { NotesSection } from "./NotesSection";
import { AddDeadlineModal } from "./AddDeadlineModal";
import { AddClassModal } from "./AddClassModal";
import { Clock, GraduationCap, Target } from "lucide-react";

interface SidebarProps {
  deadlines: Deadline[];
  classes: ClassSubject[];
  notes: Note[];
  onRemoveDeadline: (id: string) => void;
  onAddDeadline: (deadline: Omit<Deadline, "id">) => void;
  onAddClass: (classData: Omit<ClassSubject, "id" | "tasks">) => void;
  onUpdateTasks: (classId: string, tasks: Task[]) => void;
  onAddNote: (content: string) => void;
  onRemoveNote: (id: string) => void;
}

export function Sidebar({
  deadlines,
  classes,
  notes,
  onRemoveDeadline,
  onAddDeadline,
  onAddClass,
  onUpdateTasks,
  onAddNote,
  onRemoveNote,
}: SidebarProps) {
  const completedTasks = classes.reduce(
    (sum, c) => sum + c.tasks.filter((t) => t.completed).length,
    0
  );
  const totalTasks = classes.reduce((sum, c) => sum + c.tasks.length, 0);
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <aside className="w-80 h-screen overflow-y-auto bg-card/50 border-l border-border/50 p-4 space-y-6">
      {/* Progress Overview */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl gradient-purple flex items-center justify-center">
            <Target className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xl font-display font-bold text-foreground">
              {overallProgress.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">Overall Progress</p>
          </div>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill gradient-purple"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Deadlines */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Deadlines
          </h2>
          <AddDeadlineModal
            classes={classes.map((c) => ({ id: c.id, name: c.name, color: c.color }))}
            onAdd={onAddDeadline}
          />
        </div>
        <div className="space-y-3">
          {deadlines.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No deadlines set
            </p>
          ) : (
            deadlines.map((deadline) => (
              <DeadlineCard
                key={deadline.id}
                deadline={deadline}
                onRemove={onRemoveDeadline}
              />
            ))
          )}
        </div>
      </section>

      {/* Classes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-accent" />
            Classes
          </h2>
          <AddClassModal onAdd={onAddClass} />
        </div>
        <div className="space-y-3">
          {classes.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No classes added
            </p>
          ) : (
            classes.map((classSubject) => (
              <ClassCard
                key={classSubject.id}
                classSubject={classSubject}
                onUpdateTasks={onUpdateTasks}
              />
            ))
          )}
        </div>
      </section>

      {/* Notes */}
      <NotesSection
        notes={notes}
        onAddNote={onAddNote}
        onRemoveNote={onRemoveNote}
      />
    </aside>
  );
}
