import { useState } from "react";
import { TimeBlock, Deadline, ClassSubject, Note, Task } from "@/types/study";
import { TimeBlockCalendar } from "@/components/TimeBlockCalendar";
import { Sidebar } from "@/components/Sidebar";
import { AddTimeBlockModal } from "@/components/AddTimeBlockModal";
import { GraduationCap, Loader2 } from "lucide-react";
import {
  useTimeBlocks,
  useCreateTimeBlock,
  useUpdateTimeBlock,
  useDeleteTimeBlock,
  useMoveTimeBlock,
  useToggleTimeBlockComplete,
  useDeadlines,
  useCreateDeadline,
  useDeleteDeadline,
  useClasses,
  useCreateClass,
  useCreateTask,
  useToggleTask,
  useDeleteTask,
  useNotes,
  useCreateNote,
  useDeleteNote,
} from "@/hooks/useStudyApi";

const Index = () => {
  // Modal state
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // ==========================================================================
  // API Queries - Fetch data from backend
  // ==========================================================================
  const { data: timeBlocks = [], isLoading: loadingBlocks } = useTimeBlocks();
  const { data: deadlines = [], isLoading: loadingDeadlines } = useDeadlines();
  const { data: classes = [], isLoading: loadingClasses } = useClasses();
  const { data: notes = [], isLoading: loadingNotes } = useNotes();

  // ==========================================================================
  // API Mutations - Save changes to backend
  // ==========================================================================
  
  // Time Block mutations
  const createTimeBlock = useCreateTimeBlock();
  const updateTimeBlock = useUpdateTimeBlock();
  const deleteTimeBlock = useDeleteTimeBlock();
  const moveTimeBlock = useMoveTimeBlock();
  const toggleTimeBlockComplete = useToggleTimeBlockComplete();

  // Deadline mutations
  const createDeadline = useCreateDeadline();
  const removeDeadline = useDeleteDeadline();

  // Class & Task mutations
  const createClass = useCreateClass();
  const createTask = useCreateTask();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  // Note mutations
  const createNote = useCreateNote();
  const removeNote = useDeleteNote();

  // ==========================================================================
  // Time Block Handlers
  // ==========================================================================
  const handleAddTimeBlock = (block: Omit<TimeBlock, "id">) => {
    createTimeBlock.mutate(block);
  };

  const handleMoveBlock = (id: string, newDay: number, newHour: number) => {
    moveTimeBlock.mutate({ id, newDay, newHour });
  };

  const handleEditBlock = (block: TimeBlock) => {
    setEditingBlock(block);
    setEditModalOpen(true);
  };

  const handleUpdateBlock = (updatedBlock: TimeBlock) => {
    updateTimeBlock.mutate(updatedBlock);
    setEditingBlock(null);
    setEditModalOpen(false);
  };

  const handleDeleteBlock = (id: string) => {
    deleteTimeBlock.mutate(id);
  };

  const handleToggleBlockComplete = (id: string) => {
    const block = timeBlocks.find((b) => b.id === id);
    if (block) {
      toggleTimeBlockComplete.mutate({ id, completed: !block.completed });
    }
  };

  // ==========================================================================
  // Deadline Handlers
  // ==========================================================================
  const handleAddDeadline = (deadline: Omit<Deadline, "id">) => {
    createDeadline.mutate(deadline);
  };

  const handleRemoveDeadline = (id: string) => {
    removeDeadline.mutate(id);
  };

  // ==========================================================================
  // Class Handlers
  // ==========================================================================
  const handleAddClass = (classData: Omit<ClassSubject, "id" | "tasks">) => {
    createClass.mutate(classData);
  };

  const handleUpdateTasks = (classId: string, tasks: Task[]) => {
    // Find the class to get its name
    const classSubject = classes.find((c) => c.id === classId);
    if (!classSubject) return;

    // Find tasks that were toggled or added
    const existingTasks = classSubject.tasks;
    
    // Check for toggled tasks
    tasks.forEach((task) => {
      const existingTask = existingTasks.find((t) => t.id === task.id);
      if (existingTask && existingTask.completed !== task.completed) {
        // Task was toggled
        toggleTask.mutate({ id: task.id, completed: task.completed });
      } else if (!existingTask && task.id.startsWith('temp-')) {
        // New task (has temporary ID)
        createTask.mutate({ title: task.title, subject: classSubject.name });
      }
    });

    // Check for deleted tasks
    existingTasks.forEach((existingTask) => {
      if (!tasks.find((t) => t.id === existingTask.id)) {
        deleteTask.mutate(existingTask.id);
      }
    });
  };

  // ==========================================================================
  // Note Handlers
  // ==========================================================================
  const handleAddNote = (content: string) => {
    createNote.mutate(content);
  };

  const handleRemoveNote = (id: string) => {
    removeNote.mutate(id);
  };

  // ==========================================================================
  // Loading State
  // ==========================================================================
  const isLoading = loadingBlocks || loadingDeadlines || loadingClasses || loadingNotes;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your study plan...</p>
        </div>
      </div>
    );
  }

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
