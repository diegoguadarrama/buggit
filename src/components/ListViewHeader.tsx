import { TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type SortField = 'title' | 'assignee' | 'due_date' | 'priority' | 'stage';
type SortDirection = 'asc' | 'desc';

interface ListViewHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const ListViewHeader = ({ 
  sortField, 
  sortDirection, 
  onSort 
}: ListViewHeaderProps) => {
  const isMobile = useIsMobile();

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">Done</TableHead>
        <TableHead 
          className="cursor-pointer w-full md:w-auto"
          onClick={() => onSort('title')}
        >
          <div className="flex items-center gap-2">
            Title <SortIcon field="title" />
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort('assignee')}
        >
          <div className="flex items-center gap-2">
            Assignee <SortIcon field="assignee" />
          </div>
        </TableHead>
        {!isMobile && (
          <>
            <TableHead 
              className="cursor-pointer"
              onClick={() => onSort('stage')}
            >
              <div className="flex items-center gap-2">
                Stage <SortIcon field="stage" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => onSort('priority')}
            >
              <div className="flex items-center gap-2">
                Priority <SortIcon field="priority" />
              </div>
            </TableHead>
          </>
        )}
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort('due_date')}
        >
          <div className="flex items-center gap-2">
            Due Date <SortIcon field="due_date" />
          </div>
        </TableHead>
        <TableHead className="w-[50px]"></TableHead>
      </TableRow>
    </TableHeader>
  );
};