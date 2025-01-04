import { TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskAssignee } from './TaskAssignee';
import { format } from 'date-fns';
import { Calendar, Undo2 } from 'lucide-react';
import type { TaskType } from '@/types/task';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface ListViewItemProps {
  task: TaskType;
  onTaskClick: (task: TaskType) => void;
  onTaskDone: (task: TaskType) => void;
  onUnarchive: (task: TaskType, e: React.MouseEvent) => void;
}

export const ListViewItem = ({ 
  task, 
  onTaskClick, 
  onTaskDone,
  onUnarchive 
}: ListViewItemProps) => {
  const isMobile = useIsMobile();

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };

  return (
    <TableRow 
      key={task.id}
      className={`
        cursor-pointer hover:bg-muted/50
        ${task.archived ? 'opacity-50' : 'opacity-100'}
      `}
      onClick={() => onTaskClick(task)}
    >
      <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={task.stage === 'Done'}
          onCheckedChange={() => onTaskDone(task)}
        />
      </TableCell>
      <TableCell className="w-full md:w-auto">
        <div className="flex flex-col">
          <span>{task.title}</span>
          {isMobile && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>{task.stage} • {formatPriority(task.priority)}</span>
            </div>
          )}
        </div>
      </TableCell>
      {isMobile ? (
        <>
          <TableCell>
            {task.assignee && <TaskAssignee assignee={task.assignee} />}
          </TableCell>
          <TableCell>
            {task.due_date && (
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.due_date), 'MMM d')}</span>
              </div>
            )}
          </TableCell>
        </>
      ) : (
        <>
          <TableCell>
            {task.assignee && <TaskAssignee assignee={task.assignee} />}
          </TableCell>
          <TableCell>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
              {task.stage}
            </span>
          </TableCell>
          <TableCell>
            <span 
              className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${task.priority === 'high' ? 'bg-red-100 text-red-700' : ''}
                ${task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                ${task.priority === 'low' ? 'bg-green-100 text-green-700' : ''}
              `}
            >
              {formatPriority(task.priority)}
            </span>
          </TableCell>
          <TableCell>
            {task.due_date && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {format(new Date(task.due_date), 'MMM d')}
                </span>
              </div>
            )}
          </TableCell>
        </>
      )}
      <TableCell onClick={(e) => e.stopPropagation()}>
        {task.archived && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => onUnarchive(task, e)}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};