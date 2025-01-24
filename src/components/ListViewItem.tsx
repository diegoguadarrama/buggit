import { TableRow, TableCell } from "@/components/ui/table";
import { format, isValid, parseISO } from "date-fns";
import type { TaskType } from "@/types/task";
import { TaskAssignee } from "./TaskAssignee";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

interface ListViewItemProps {
  task: TaskType;
  onTaskClick: (task: TaskType) => void;
  onTaskDone: (task: TaskType) => Promise<void>;
}

const formatTaskDate = (dateString: string | undefined) => {
  if (!dateString) return null;
  
  try {
    const date = parseISO(dateString);
    
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

// src/components/ListViewItem.tsx

export const ListViewItem = ({ task, onTaskClick, onTaskDone }: ListViewItemProps) => {
  const { t } = useTranslation();
  
  const handleCheckboxClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onTaskDone(task);
  };

  const isCompleted = task.stage === 'Done';

  return (
    <TableRow
      className={`
        ${task.archived ? 'opacity-50' : ''} 
        cursor-pointer 
        hover:bg-gray-50 
        ${isCompleted ? 'bg-green-50/40' : ''}
        transition-colors
        duration-200
      `}
      onClick={() => onTaskClick(task)}
    >
      <TableCell className="w-10 pr-0">
        <input 
          type="checkbox" 
          checked={isCompleted} 
          onChange={() => onTaskDone(task)}
          onClick={handleCheckboxClick}
          className={`
            h-4 w-4 rounded border-gray-300 
            ${isCompleted ? 'accent-green-600' : 'accent-[#123524]'} 
            dark:accent-[#00ff80]
            transition-colors
          `}
        />
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className={`
            font-medium 
            flex 
            items-center 
            gap-2
            ${isCompleted ? 'text-green-700' : ''}
          `}>
            {isCompleted && (
              <div className="flex-shrink-0"> 
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>  
            )}
            <span className={isCompleted ? 'line-through' : ''}>
              {task.title}
            </span>
          </div>
          
          {/* Mobile metadata */}
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className={`
              inline-flex items-center
              ${task.priority === 'high' ? 'text-red-700' : ''}
              ${task.priority === 'medium' ? 'text-orange-700' : ''}
              ${task.priority === 'low' ? 'text-gray-600' : ''}
              ${isCompleted ? 'opacity-50' : ''}
            `}>
              {t(`task.priority.${task.priority}`)}
            </span>
            <span className="text-gray-400">•</span>
            <span className={`
              ${isCompleted ? 'text-green-600' : 'text-gray-600'}
            `}>
              {t(`task.stage.${task.stage.toLowerCase()}`)}
            </span>
          </div>
        </div>
      </TableCell>
      
      {/* Desktop-only cells */}
      <TableCell className="hidden sm:table-cell">
        <div className={isCompleted ? 'opacity-50' : ''}>
          {task.assignee ? (
            <TaskAssignee assignee={task.assignee} />
          ) : (
            <span className="text-sm text-gray-500">{t('common.unassigned')}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <span className={`
          text-sm text-gray-600
          ${isCompleted ? 'opacity-50' : ''}
        `}>
          {formatTaskDate(task.due_date)}
        </span>
      </TableCell>
    </TableRow>
  );
};
