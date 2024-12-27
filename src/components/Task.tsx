import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TaskType } from '@/types/task';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Calendar, Image } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

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

  const getDateColor = (dateStr: string | undefined) => {
    if (!dateStr) return 'text-gray-500';
    
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

  const firstImage = task.attachments?.find(url => {
    const extension = url.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{task.title}</h3>
      </div>
      
      {firstImage && (
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative mb-3 cursor-pointer group">
              <img 
                src={firstImage} 
                alt={task.title}
                className="w-full h-32 object-cover rounded-md"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-md flex items-center justify-center">
                <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <img 
              src={firstImage} 
              alt={task.title}
              className="w-full h-auto"
            />
          </DialogContent>
        </Dialog>
      )}
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          {task.assignee ? (
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={`https://avatar.vercel.sh/${task.assignee}.png`} />
                <AvatarFallback>{task.assignee[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{task.assignee}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">Unassigned</span>
            </div>
          )}
          
          {task.attachments?.length > 0 && (
            <div className="flex items-center text-gray-500">
              {firstImage ? (
                <Image className="h-4 w-4 mr-1" />
              ) : (
                <Paperclip className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm">{task.attachments.length}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className={`priority-${task.priority}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </div>
          <div className="flex items-center gap-2">
            {task.due_date && (
              <div className={`flex items-center ${getDateColor(task.due_date)}`}>
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {format(new Date(task.due_date), 'MMM d')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};