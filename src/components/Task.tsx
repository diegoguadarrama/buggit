import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TaskType } from '@/types/task';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from './ui/button';

interface TaskProps {
  task: TaskType;
  isDragging?: boolean;
}

export const Task = ({ task, isDragging }: TaskProps) => {
  const { toast } = useToast();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id);

    if (error) {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{task.title}</h3>
        <div className="flex items-center gap-2">
          <div className={`priority-${task.priority}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-500"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={`https://avatar.vercel.sh/${task.assignee}.png`} />
            <AvatarFallback>{task.assignee[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">{task.assignee}</span>
        </div>
        
        {task.attachments?.length > 0 && (
          <div className="flex items-center text-gray-500">
            <Paperclip className="h-4 w-4 mr-1" />
            <span className="text-sm">{task.attachments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};