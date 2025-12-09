import { useState } from "react";
import { Deadline, ClassSubject, Note, Task } from "@/types/study";
import { DeadlineCard } from "@/components/DeadlineCard";
import { ClassCard } from "@/components/ClassCard";
import { NotesSection } from "@/components/NotesSection";
import { AddDeadlineModal } from "@/components/AddDeadlineModal";
import { AddClassModal } from "@/components/AddClassModal";
import { GraduationCap, Target, Clock } from "lucide-react";

// Sample data
const initialClasses: ClassSubject[] = [
  {
    id: "1",
    name: "Mathematics",
    color: "purple",
    tasks: [
      { id: "t1", title: "Complete Chapter 5 exercises", completed: true },
      { id: "t2", title: "Review quadratic formulas", completed: false },
      { id: "t3", title: "Practice integration problems", completed: false },
    ],
  },
  {
    id: "2",
    name: "Computer Science",
    color: "cyan",
    tasks: [
      { id: "t4", title: "Finish algorithm assignment", completed: true },
      { id: "t5", title: "Study data structures", completed: true },
      { id: "t6", title: "Build portfolio project", completed: false },
    ],
  },
  {
    id: "3",
    name: "Physics",
    color: "orange",
    tasks: [
      { id: "t7", title: "Lab report on optics", completed: false },
      { id: "t8", title: "Revise thermodynamics", completed: false },
    ],
  },
];

const initialDeadlines: Deadline[] = [
  {
    id: "d1",
    title: "Final Exam",
    className: "Mathematics",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    color: "purple",
  },
  {
    id: "d2",
    title: "Project Submission",
    className: "Computer Science",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    color: "cyan",
  },
];

const initialNotes: Note[] = [
  {
    id: "n1",
    content: "Remember to review the integration by parts technique before the exam!",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

const Index = () => {
  const [classes, setClasses] = useState<ClassSubject[]>(initialClasses);
  const [deadlines, setDeadlines] = useState<Deadline[]>(initialDeadlines);
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const handleAddDeadline = (deadline: Omit<Deadline, "id">) => {
    setDeadlines([...deadlines, { ...deadline, id: crypto.randomUUID() }]);
  };

  const handleRemoveDeadline = (id: string) => {
    setDeadlines(deadlines.filter((d) => d.id !== id));
  };

  const handleAddClass = (classData: Omit<ClassSubject, "id" | "tasks">) => {
    setClasses([...classes, { ...classData, id: crypto.randomUUID(), tasks: [] }]);
  };

  const handleUpdateTasks = (classId: string, tasks: Task[]) => {
    setClasses(
      classes.map((c) => (c.id === classId ? { ...c, tasks } : c))
    );
  };

  const handleAddNote = (content: string) => {
    setNotes([
      { id: crypto.randomUUID(), content, createdAt: new Date() },
      ...notes,
    ]);
  };

  const handleRemoveNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  // Calculate overall progress
  const totalTasks = classes.reduce((sum, c) => sum + c.tasks.length, 0);
  const completedTasks = classes.reduce(
    (sum, c) => sum + c.tasks.filter((t) => t.completed).length,
    0
  );
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-purple flex items-center justify-center glow-purple">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">
                  StudyFlow
                </h1>
                <p className="text-xs text-muted-foreground">
                  Track your progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AddClassModal onAdd={handleAddClass} />
              <AddDeadlineModal
                classes={classes.map((c) => ({ id: c.id, name: c.name, color: c.color }))}
                onAdd={handleAddDeadline}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl gradient-purple flex items-center justify-center">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">
                {overallProgress.toFixed(0)}%
              </p>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl gradient-orange flex items-center justify-center">
              <Clock className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">
                {deadlines.length}
              </p>
              <p className="text-sm text-muted-foreground">Active Deadlines</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl gradient-cyan flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">
                {completedTasks}/{totalTasks}
              </p>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>
          </div>
        </div>

        {/* Deadlines Section */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Upcoming Deadlines
          </h2>
          {deadlines.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground">
                No deadlines yet. Add one to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deadlines.map((deadline, index) => (
                <div key={deadline.id} style={{ animationDelay: `${index * 100}ms` }}>
                  <DeadlineCard deadline={deadline} onRemove={handleRemoveDeadline} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Classes & Notes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classes Section */}
          <section className="lg:col-span-2">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-accent" />
              Your Classes
            </h2>
            {classes.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-muted-foreground">
                  No classes yet. Add your first class to start tracking!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((classSubject, index) => (
                  <div key={classSubject.id} style={{ animationDelay: `${index * 100}ms` }}>
                    <ClassCard
                      classSubject={classSubject}
                      onUpdateTasks={handleUpdateTasks}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Notes Section */}
          <section>
            <NotesSection
              notes={notes}
              onAddNote={handleAddNote}
              onRemoveNote={handleRemoveNote}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
