import { Button } from "@/components/ui/button";
import { KanbanSquare, LayoutList, CalendarDays, Plus, NotebookText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface ViewSwitcherProps {
  viewMode: 'board' | 'list' | 'calendar' | 'notes';
  setViewMode: (mode: 'board' | 'list' | 'calendar' | 'notes') => void;
  onAddTask: () => void;
}

export const ViewSwitcher = ({ viewMode, setViewMode, onAddTask }: ViewSwitcherProps) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-1 md:gap-2 border rounded-lg p-1">
        <Button
          variant={viewMode === 'board' ? 'default' : 'ghost'}
          size={isMobile ? 'icon' : 'sm'}
          onClick={() => setViewMode('board')}
          className={`h-8 w-8 md:h-9 md:w-auto ${viewMode === 'board' ? 'bg-gray-100 hover:bg-gray-100 text-black' : ''}`}
        >
          <KanbanSquare className="h-4 w-4" />
          {!isMobile && <span className="ml-2">{t('views.board')}</span>}
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size={isMobile ? 'icon' : 'sm'}
          onClick={() => setViewMode('list')}
          className={`h-8 w-8 md:h-9 md:w-auto ${viewMode === 'list' ? 'bg-gray-100 hover:bg-gray-100 text-black' : ''}`}
        >
          <LayoutList className="h-4 w-4" />
          {!isMobile && <span className="ml-2">{t('views.list')}</span>}
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'ghost'}
          size={isMobile ? 'icon' : 'sm'}
          onClick={() => setViewMode('calendar')}
          className={`h-8 w-8 md:h-9 md:w-auto ${viewMode === 'calendar' ? 'bg-gray-100 hover:bg-gray-100 text-black' : ''}`}
        >
          <CalendarDays className="h-4 w-4" />
          {!isMobile && <span className="ml-2">{t('views.calendar')}</span>}
        </Button>
        <Button
          variant={viewMode === 'notes' ? 'default' : 'ghost'}
          size={isMobile ? 'icon' : 'sm'}
          onClick={() => {
            setViewMode('notes');
            navigate('/notes');
          }}
          className={`h-8 w-8 md:h-9 md:w-auto ${viewMode === 'notes' ? 'bg-gray-100 hover:bg-gray-100 text-black' : ''}`}
        >
          <NotebookText className="h-4 w-4" />
          {!isMobile && <span className="ml-2">{t('views.notes')}</span>}
        </Button>
      </div>
      {!isMobile && (
        <Button
          size="sm"
          onClick={onAddTask}
          className="h-9 bg-green-900 hover:bg-primary text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('common.addTask')}
        </Button>
      )}
    </div>
  );
};
