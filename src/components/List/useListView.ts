import { useState } from 'react';
import type { TaskType } from '@/types/task';

type SortField = 'title' | 'assignee' | 'due_date' | 'priority' | 'stage';
type SortDirection = 'asc' | 'desc';

export const useListView = (tasks: TaskType[]) => {
  const [sortField, setSortField] = useState<SortField>('due_date');
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

  return {
    sortField,
    sortDirection,
    handleSort,
    sortedTasks
  };
};