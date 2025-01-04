import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Archive, Undo2 } from "lucide-react";
import type { TaskType } from "@/types/task";
import { useIsMobile } from "@/hooks/use-mobile";

interface TaskHeaderProps {
  task: TaskType | null;
  onTaskArchive?: (taskId: string) => Promise<void>;
  onTaskUpdate?: (task: TaskType) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export const TaskHeader = ({ task, onTaskArchive, onTaskUpdate, onOpenChange }: TaskHeaderProps) => {
  const isMobile = useIsMobile();

  const handleArchive = async () => {
    if (task && onTaskArchive) {
      await onTaskArchive(task.id);
      onOpenChange(false);
    }
  };

  const handleUnarchive = async () => {
    if (task && onTaskUpdate) {
      await onTaskUpdate({
        ...task,
        archived: false
      });
      onOpenChange(false);
    }
  };

  return (
    <SheetHeader className="p-6 border-b relative">
      <div className="flex items-center justify-between w-full pr-8">
        <SheetTitle>{task ? 'Update Task' : 'Create New Task'}</SheetTitle>
        {task && (task.archived ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnarchive}
            className="shrink-0 ml-2"
          >
            <Undo2 className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Unarchive</span>}
          </Button>
        ) : onTaskArchive && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleArchive}
            className="shrink-0 ml-2"
          >
            <Archive className="h-4 w-4" />
            {!isMobile && <span className="ml-2">Archive</span>}
          </Button>
        ))}
      </div>
    </SheetHeader>
  );
};