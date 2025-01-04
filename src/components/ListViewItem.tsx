import { TableRow, TableCell } from "@/components/ui/table";
import { format, isValid } from "date-fns";
import type { TaskType } from "@/types/task";
import { TaskAssignee } from "./TaskAssignee";

interface ListViewItemProps {
  task: TaskType;
  onTaskClick: (task: TaskType) => void;
  onTaskDone: (task: TaskType) => Promise<void>;
}

const formatTaskDate = (dateString: string | undefined) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (!isValid(date)) return null;
  
  // Ensure we're working with UTC dates consistently
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return format(utcDate, 'MMM d');
};

export const ListViewItem = ({ task, onTaskClick, onTaskDone }: ListViewItemProps) => {
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
          className="h-4 w-4 rounded border-gray-300 accent-[#123524] dark:accent-[#00ff80]"
        />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium">{task.title}</div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`
              inline-flex px-2 py-0.5 rounded-full text-xs font-medium border
              ${task.priority === 'high' ? 'text-red-700 border-red-700 dark:border-red-500 dark:text-red-500' : ''}
              ${task.priority === 'medium' ? 'text-yellow-700 border-yellow-700 dark:border-yellow-500 dark:text-yellow-500' : ''}
              ${task.priority === 'low' ? 'text-green-700 border-green-700 dark:border-green-500 dark:text-green-500' : ''}
            `}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{task.stage}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {task.assignee ? (
          <TaskAssignee assignee={task.assignee} />
        ) : (
          <span className="text-sm text-gray-500">Unassigned</span>
        )}
      </TableCell>
      <TableCell>
        {task.due_date && (
          <span className="text-sm text-gray-600">
            {formatTaskDate(task.due_date)}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
};