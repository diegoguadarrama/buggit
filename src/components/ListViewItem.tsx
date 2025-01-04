import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Archive, Undo2 } from "lucide-react";
import { format, isValid } from "date-fns";
import type { TaskType } from "@/types/task";
import { TaskAssignee } from "./TaskAssignee";

interface ListViewItemProps {
  task: TaskType;
  onTaskClick: (task: TaskType) => void;
  onTaskDone: (task: TaskType) => Promise<void>;
  onUnarchive: (task: TaskType, e: React.MouseEvent) => Promise<void>;
}

const formatTaskDate = (dateString: string | undefined) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (!isValid(date)) return null;
  
  // Ensure we're working with UTC dates consistently
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return format(utcDate, 'MMM d');
};

export const ListViewItem = ({ task, onTaskClick, onTaskDone, onUnarchive }: ListViewItemProps) => {
  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onUnarchive(task, e);
  };

  const handleCheckboxClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onTaskDone(task);
  };

  return (
    <TableRow
      className={`${task.archived ? 'opacity-50' : ''} cursor-pointer hover:bg-gray-50`}
      onClick={() => onTaskClick(task)}
    >
      <TableCell>
        <input 
          type="checkbox" 
          checked={task.stage === 'Done'} 
          onChange={() => onTaskDone(task)}
          onClick={handleCheckboxClick}
          className="h-4 w-4 rounded border-gray-300"
        />
      </TableCell>
      <TableCell className="font-medium">{task.title}</TableCell>
      <TableCell>
        {task.assignee ? (
          <TaskAssignee assignee={task.assignee} />
        ) : (
          <span className="text-sm text-gray-500">Unassigned</span>
        )}
      </TableCell>
      <TableCell>{task.stage}</TableCell>
      <TableCell>
        <div
          className={`
            inline-flex px-2 py-1 rounded-full text-xs font-medium
            ${task.priority === 'high' ? 'bg-red-100 text-red-700' : ''}
            ${task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : ''}
            ${task.priority === 'low' ? 'bg-green-100 text-green-700' : ''}
          `}
        >
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </div>
      </TableCell>
      <TableCell>
        {task.due_date && (
          <span className="text-sm text-gray-600">
            {formatTaskDate(task.due_date)}
          </span>
        )}
      </TableCell>
      <TableCell>
        {task.archived ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleUnarchive}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onTaskDone(task);
            }}
          >
            <Archive className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};