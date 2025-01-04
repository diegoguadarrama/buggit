import { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import type { TaskType } from '@/types/task';
import { ListViewHeader } from './ListViewHeader';
import { ListViewItem } from './ListViewItem';

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

  return (
    <div className="-mx-6 px-2 md:px-0">
      <div className="rounded-md border max-w-[1600px] mx-auto">
        <Table>
          <ListViewHeader 
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <TableBody>
            {sortedTasks.map((task) => (
              <ListViewItem
                key={task.id}
                task={task}
                onTaskClick={onTaskClick}
                onTaskDone={handleTaskDone}
                onUnarchive={handleUnarchive}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};