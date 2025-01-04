import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { TaskAssignee } from './TaskAssignee';
import { format } from 'date-fns';
import type { TaskType } from '@/types/task';
import { Calendar, ChevronDown, ChevronUp, Undo2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from './ui/button';

interface ListViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
  onTaskUpdate: (task: TaskType) => Promise<void>;
}

type SortField = 'title' | 'assignee' | 'due_date' | 'priority' | 'stage';
type SortDirection = 'asc' | 'desc';

export const ListView = ({ tasks, onTaskClick, onTaskUpdate }: ListViewProps) => {
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const isMobile = useIsMobile();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'title':
        return direction * a.title.localeCompare(b.title);
      case 'assignee':
        return direction * (a.assignee || '').localeCompare(b.assignee || '');
      case 'due_date':
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return direction;
        if (!b.due_date) return -direction;
        return direction * (new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return direction * (priorityOrder[a.priority] - priorityOrder[b.priority]);
      case 'stage':
        return direction * a.stage.localeCompare(b.stage);
      default:
        return 0;
    }
  });

  const handleTaskDone = async (task: TaskType) => {
    await onTaskUpdate({
      ...task,
      stage: task.stage === 'Done' ? 'To Do' : 'Done'
    });
  };

  const handleUnarchive = async (task: TaskType, e: React.MouseEvent) => {
    e.stopPropagation();
    await onTaskUpdate({
      ...task,
      archived: false
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Done</TableHead>
            <TableHead 
              className={`cursor-pointer ${isMobile ? 'w-[60%]' : ''}`}
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center gap-2">
                Title <SortIcon field="title" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('assignee')}
            >
              <div className="flex items-center gap-2">
                Assignee <SortIcon field="assignee" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('stage')}
            >
              <div className="flex items-center gap-2">
                Stage <SortIcon field="stage" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('priority')}
            >
              <div className="flex items-center gap-2">
                Priority <SortIcon field="priority" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('due_date')}
            >
              <div className="flex items-center gap-2">
                Due Date <SortIcon field="due_date" />
              </div>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => (
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
                  onCheckedChange={() => handleTaskDone(task)}
                />
              </TableCell>
              <TableCell className={isMobile ? 'w-[60%]' : ''}>
                {task.title}
              </TableCell>
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
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
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
              <TableCell onClick={(e) => e.stopPropagation()}>
                {task.archived && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleUnarchive(task, e)}
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};