import { TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type SortField = 'title' | 'assignee' | 'due_date' | 'priority' | 'stage';
type SortDirection = 'asc' | 'desc';

interface ListViewFiltersProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const ListViewFilters = ({ 
  sortField, 
  sortDirection, 
  onSort 
}: ListViewFiltersProps) => {
  const { t } = useTranslation();
  
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">{t('task.stage.done')}</TableHead>
        <TableHead 
          className="cursor-pointer w-full md:w-[40%]"
          onClick={() => onSort('title')}
        >
          <div className="flex items-center gap-2">
            {t('task.title')} <SortIcon field="title" />
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer w-[30%]"
          onClick={() => onSort('assignee')}
        >
          <div className="flex items-center gap-2">
            {t('task.assignee')} <SortIcon field="assignee" />
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer"
          onClick={() => onSort('due_date')}
        >
          <div className="flex items-center gap-2">
            {t('task.dueDate')} <SortIcon field="due_date" />
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};