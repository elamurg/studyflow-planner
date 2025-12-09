import { TimeBlock } from "@/types/study";
import { GripVertical, Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

interface TimeBlockItemProps {
  block: TimeBlock;
  onDragStart: () => void;
  onDragEnd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

const colorClasses = {
  purple: "bg-primary/90 border-primary",
  orange: "bg-accent/90 border-accent",
  cyan: "bg-cyan-500/90 border-cyan-500",
  pink: "bg-pink-500/90 border-pink-500",
};

const durationToHeight = (duration: number) => {
  // Each hour slot is 60px, so duration in minutes maps accordingly
  const height = (duration / 60) * 56; // slightly less than 60 to account for gaps
  return Math.max(height, 50); // minimum height
};

export function TimeBlockItem({
  block,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  onToggleComplete,
}: TimeBlockItemProps) {
  const height = durationToHeight(block.duration);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className={`group relative rounded-lg border-l-4 ${colorClasses[block.color]} ${
            block.completed ? "opacity-60" : ""
          } p-2 cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] hover:shadow-lg`}
          style={{ minHeight: `${height}px` }}
        >
          {/* Drag Handle */}
          <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-primary-foreground/50" />
          </div>

          {/* Content */}
          <div className="pl-4">
            <div className="flex items-start justify-between gap-1">
              <h4
                className={`text-xs font-semibold text-primary-foreground leading-tight ${
                  block.completed ? "line-through" : ""
                }`}
              >
                {block.title}
              </h4>

              {/* Actions */}
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete();
                  }}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-primary-foreground/70 hover:text-destructive hover:bg-primary-foreground/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-primary-foreground/70 mt-0.5">
              {block.duration} min
            </p>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div>
          <p className="font-semibold">{block.title}</p>
          <p className="text-xs text-muted-foreground">{block.duration} minutes</p>
          {block.description && (
            <p className="text-sm mt-1 text-foreground/80">{block.description}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
