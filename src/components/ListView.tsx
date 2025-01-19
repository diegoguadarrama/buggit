// src/components/ListView.tsx
import { Table, TableBody } from '@/components/ui/table';
import type { TaskType } from '@/types/task';
import { ListViewFilters } from './List/ListViewFilters';
import { ListViewItem } from './ListViewItem';
import { useListView } from './List/useListView';
import { CheckCircle2 } from 'lucide-react';

interface ListViewProps {
  tasks: TaskType[];
  onTaskClick: (task: TaskType) => void;
  onTaskUpdate: (task: TaskType) => Promise<void>;
}

export const ListView = ({ tasks, onTaskClick, onTaskUpdate }: ListViewProps) => {
  const {
    sortField,
    sortDirection,
    handleSort,
    sortedTasks
  } = useListView(tasks);

  // Separate tasks into active and completed
  const activeTasks = sortedTasks.filter(task => task.stage !== 'Done');
  const completedTasks = sortedTasks.filter(task => task.stage === 'Done');

  const handleTaskDone = async (task: TaskType) => {
    await onTaskUpdate({
      ...task,
      stage: task.stage === 'Done' ? 'To Do' : 'Done'
    });
  };

  return (
    <div className="-mx-2 px-0 md:px-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1600px] mx-auto">
        {/* Active Tasks Table */}
        <div className="rounded-md border">
          <div className="bg-background p-4 border-b">
            <h2 className="text-lg font-semibold">Active Tasks</h2>
            <p className="text-sm text-muted-foreground">
              {activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Table>
            <ListViewFilters 
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <TableBody>
              {activeTasks.map((task) => (
                <ListViewItem
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                  onTaskDone={handleTaskDone}
                />
              ))}
              {activeTasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    No active tasks
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Completed Tasks Table */}
        <div className="rounded-md border">
          <div className="bg-background p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Completed Tasks
              </h2>
              <p className="text-sm text-muted-foreground">
                {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} completed
              </p>
            </div>
          </div>
          <Table>
            <ListViewFilters 
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <TableBody>
              {completedTasks.map((task) => (
                <ListViewItem
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                  onTaskDone={handleTaskDone}
                />
              ))}
              {completedTasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    No completed tasks
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
