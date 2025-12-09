import { useState } from "react";
import { TimeBlock, Deadline, ClassSubject, Note, Task } from "@/types/study";
import { TimeBlockCalendar } from "@/components/TimeBlockCalendar";
import { Sidebar } from "@/components/Sidebar";
import { AddTimeBlockModal } from "@/components/AddTimeBlockModal";
import { GraduationCap } from "lucide-react";

// Sample data
const initialClasses: ClassSubject[] = [
  {
    id: "1",
    name: "Mathematics",
    color: "purple",
    tasks: [
      { id: "t1", title: "Complete Chapter 5 exercises", completed: true },
      { id: "t2", title: "Review quadratic formulas", completed: false },
    ],
  },
  {
    id: "2",
    name: "Computer Science",
    color: "cyan",
    tasks: [
      { id: "t4", title: "Finish algorithm assignment", completed: true },
      { id: "t5", title: "Study data structures", completed: false },
    ],
  },
  {
    id: "3",
    name: "Physics",
    color: "orange",
    tasks: [
      { id: "t7", title: "Lab report on optics", completed: false },
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
    content: "Review integration by parts before exam!",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

const today = new Date().getDay();
const initialTimeBlocks: TimeBlock[] = [
  {
    id: "tb1",
    title: "Math Study Session",
    description: "Focus on calculus chapter 5 problems",
    duration: 60,
    startHour: 9,
    day: today,
    color: "purple",
    completed: false,
  },
  {
    id: "tb2",
    title: "CS Project Work",
    description: "Implement the sorting algorithm",
    duration: 90,
    startHour: 11,
    day: today,
    color: "cyan",
    completed: false,
  },
  {
    id: "tb3",
    title: "Physics Lab Prep",
    description: "Read through the optics experiment procedure",
    duration: 45,
    startHour: 14,
    day: today,
    color: "orange",
    completed: true,
  },
];

const Index = () => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(initialTimeBlocks);
  const [classes, setClasses] = useState<ClassSubject[]>(initialClasses);
  const [deadlines, setDeadlines] = useState<Deadline[]>(initialDeadlines);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Time Block handlers
  const handleAddTimeBlock = (block: Omit<TimeBlock, "id">) => {
    setTimeBlocks([...timeBlocks, { ...block, id: crypto.randomUUID() }]);
  };

  const handleMoveBlock = (id: string, newDay: number, newHour: number) => {
    setTimeBlocks(
      timeBlocks.map((block) =>
        block.id === id ? { ...block, day: newDay, startHour: newHour } : block
      )
    );
  };

  const handleEditBlock = (block: TimeBlock) => {
    setEditingBlock(block);
    setEditModalOpen(true);
  };

  const handleUpdateBlock = (updatedBlock: TimeBlock) => {
    setTimeBlocks(
      timeBlocks.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block
      )
    );
    setEditingBlock(null);
    setEditModalOpen(false);
  };

  const handleDeleteBlock = (id: string) => {
    setTimeBlocks(timeBlocks.filter((block) => block.id !== id));
  };

  const handleToggleBlockComplete = (id: string) => {
    setTimeBlocks(
      timeBlocks.map((block) =>
        block.id === id ? { ...block, completed: !block.completed } : block
      )
    );
  };

  // Deadline handlers
  const handleAddDeadline = (deadline: Omit<Deadline, "id">) => {
    setDeadlines([...deadlines, { ...deadline, id: crypto.randomUUID() }]);
  };

  const handleRemoveDeadline = (id: string) => {
    setDeadlines(deadlines.filter((d) => d.id !== id));
  };

  // Class handlers
  const handleAddClass = (classData: Omit<ClassSubject, "id" | "tasks">) => {
    setClasses([...classes, { ...classData, id: crypto.randomUUID(), tasks: [] }]);
  };

  const handleUpdateTasks = (classId: string, tasks: Task[]) => {
    setClasses(classes.map((c) => (c.id === classId ? { ...c, tasks } : c)));
  };

  // Note handlers
  const handleAddNote = (content: string) => {
    setNotes([
      { id: crypto.randomUUID(), content, createdAt: new Date() },
      ...notes,
    ]);
  };

  const handleRemoveNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
          <div className="px-6 py-4">
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
                    Drag tasks to reschedule
                  </p>
                </div>
              </div>
              <AddTimeBlockModal onAdd={handleAddTimeBlock} />
            </div>
          </div>
        </header>

        {/* Calendar */}
        <main className="flex-1 p-6 overflow-hidden">
          <TimeBlockCalendar
            timeBlocks={timeBlocks}
            onMoveBlock={handleMoveBlock}
            onEditBlock={handleEditBlock}
            onDeleteBlock={handleDeleteBlock}
            onToggleComplete={handleToggleBlockComplete}
          />
        </main>
      </div>

      {/* Sidebar */}
      <Sidebar
        deadlines={deadlines}
        classes={classes}
        notes={notes}
        onRemoveDeadline={handleRemoveDeadline}
        onAddDeadline={handleAddDeadline}
        onAddClass={handleAddClass}
        onUpdateTasks={handleUpdateTasks}
        onAddNote={handleAddNote}
        onRemoveNote={handleRemoveNote}
      />

      {/* Edit Modal */}
      <AddTimeBlockModal
        onAdd={handleAddTimeBlock}
        editBlock={editingBlock}
        onUpdate={handleUpdateBlock}
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setEditingBlock(null);
        }}
      />
    </div>
  );
};

export default Index;
