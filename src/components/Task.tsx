import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TaskType } from '@/types/task';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip } from 'lucide-react';
import { format } from 'date-fns';

interface TaskProps {
  task: TaskType;
  isDragging?: boolean;
}

export const Task = ({ task, isDragging }: TaskProps) => {
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

  const getDateColor = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = new Date(dateStr);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate <= today) {
      return 'text-[#ea384c]'; // Red for today or past
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return 'text-[#F97316]'; // Orange for tomorrow
    }
    return 'text-gray-500'; // Default color
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
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      
      <div className="flex flex-col gap-2">
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

        <div className="flex justify-between items-center">
          <div className={`priority-${task.priority}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </div>
          <span className={`text-sm ${getDateColor(task.created_at)}`}>
            {format(new Date(task.created_at), 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    </div>
  );
};
