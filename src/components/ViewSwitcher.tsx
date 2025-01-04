import { Button } from "@/components/ui/button";
import { KanbanSquare, LayoutList, CalendarDays, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ViewSwitcherProps {
  viewMode: 'board' | 'list' | 'calendar';
  setViewMode: (mode: 'board' | 'list' | 'calendar') => void;
  onAddTask: () => void;
}

export const ViewSwitcher = ({ viewMode, setViewMode, onAddTask }: ViewSwitcherProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex gap-2 items-center">
      <div className="flex gap-1 md:gap-2 border rounded-lg p-1">
        <Button
          variant={viewMode === 'board' ? 'default' : 'ghost'}
          size={isMobile ? 'icon' : 'sm'}
          onClick={() => setViewMode('board')}
          className="h-8 w-8 md:h-9 md:w-auto"
        >
          <KanbanSquare className="h-4 w-4" />
          {!isMobile && <span className="ml-2">Board</span>}
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size={isMobile ? 'icon' : 'sm'}
          onClick={() => setViewMode('list')}
          className="h-8 w-8 md:h-9 md:w-auto"
        >
          <LayoutList className="h-4 w-4" />
          {!isMobile && <span className="ml-2">List</span>}
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'ghost'}
          size={isMobile ? 'icon' : 'sm'}
          onClick={() => setViewMode('calendar')}
          className="h-8 w-8 md:h-9 md:w-auto"
        >
          <CalendarDays className="h-4 w-4" />
          {!isMobile && <span className="ml-2">Calendar</span>}
        </Button>
      </div>
      {!isMobile && (
        <Button
          size="sm"
          onClick={onAddTask}
          className="h-9"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      )}
    </div>
  );
};