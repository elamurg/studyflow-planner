import { useState } from "react";
import { Note } from "@/types/study";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Plus, Trash2, StickyNote } from "lucide-react";
import { format } from "date-fns";

interface NotesSectionProps {
  notes: Note[];
  onAddNote: (content: string) => void;
  onRemoveNote: (id: string) => void;
}

export function NotesSection({ notes, onAddNote, onRemoveNote }: NotesSectionProps) {
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onAddNote(newNote.trim());
    setNewNote("");
  };

  return (
    <div className="glass-card p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="h-5 w-5 text-accent" />
        <h3 className="font-display text-lg font-semibold text-foreground">
          Study Notes
        </h3>
      </div>

      {/* Add Note */}
      <div className="mb-4">
        <Textarea
          placeholder="Write a note for your future self..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="bg-secondary/50 border-border/50 text-sm min-h-[80px] resize-none mb-2"
        />
        <Button
          variant="gradientOrange"
          size="sm"
          onClick={handleAddNote}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No notes yet. Start writing!
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-xl bg-secondary/50 border border-border/30 group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {format(note.createdAt, "MMM d, h:mm a")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveNote(note.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
