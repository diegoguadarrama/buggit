import { Table, TableBody } from '@/components/ui/table';
import type { TaskType } from '@/types/task';
import { ListViewFilters } from './List/ListViewFilters';
import { ListViewItem } from './ListViewItem';
import { useListView } from './List/useListView';

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

  const handleTaskDone = async (task: TaskType) => {
    await onTaskUpdate({
      ...task,
      stage: task.stage === 'Done' ? 'To Do' : 'Done'
    });
  };

  return (
    <div className="-mx-2 px-0 md:px-0">
      <div className="rounded-md border max-w-[1600px] mx-auto">
        <Table>
          <ListViewFilters 
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
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};