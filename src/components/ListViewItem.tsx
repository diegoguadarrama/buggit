import { TableRow, TableCell } from "@/components/ui/table";
import { format, isValid, parseISO } from "date-fns";
import type { TaskType } from "@/types/task";
import { TaskAssignee } from "./TaskAssignee";
import { useTranslation } from "react-i18next";

interface ListViewItemProps {
  task: TaskType;
  onTaskClick: (task: TaskType) => void;
  onTaskDone: (task: TaskType) => Promise<void>;
}

const formatTaskDate = (dateString: string | undefined) => {
  if (!dateString) return null;
  
  try {
    // First try to parse the ISO string
    const date = parseISO(dateString);
    
    // Validate the parsed date
    if (!isValid(date)) {
      console.warn('Invalid date:', dateString);
      return null;
    }
    
    return format(date, 'MMM d');
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

export const ListViewItem = ({ task, onTaskClick, onTaskDone }: ListViewItemProps) => {
  const { t } = useTranslation();
  
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
              ${task.priority === 'medium' ? 'text-yellow-500 border-yellow-500 dark:border-yellow-500 dark:text-yellow-500' : ''}
              ${task.priority === 'low' ? 'text-green-700 border-green-700 dark:border-green-500 dark:text-green-500' : ''}
            `}>
              {t(`task.priority.${task.priority}`)}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">{t(`task.stage.${task.stage.toLowerCase()}`)}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {task.assignee ? (
          <TaskAssignee assignee={task.assignee} />
        ) : (
          <span className="text-sm text-gray-500">{t('common.unassigned')}</span>
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
