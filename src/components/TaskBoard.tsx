import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Column } from './Column';
import { Task } from './Task';
import { Button } from '@/components/ui/button';
import { Plus, Users, Archive, ChevronDown } from 'lucide-react';
import { TaskSidebar } from './TaskSidebar';
import { UserMenu } from './UserMenu';
import { useProject } from './ProjectContext';
import { ProjectDialog } from './ProjectDialog';
import { NoProjectsFound } from './NoProjectsFound';
import { useTaskBoard } from './useTaskBoard';
import { ProjectMembersDialog } from './ProjectMembersDialog';
import { ProjectSwitcher } from './ProjectSwitcher';
import { ListView } from './ListView';
import { CalendarView } from './CalendarView';
import { ViewSwitcher } from './ViewSwitcher';
import { TaskProgress } from './TaskProgress';
import { useTranslation } from 'react-i18next';
import type { TaskType, Stage } from '@/types/task';
import { useIsMobile } from '@/hooks/use-mobile';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type SortField = 'title' | 'priority' | 'assignee' | 'due_date' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

interface ColumnSortConfig {
  [key: string]: SortConfig | undefined;
}

interface TaskBoardProps {
  onProfileClick: () => void;
}

type ViewMode = 'board' | 'list' | 'calendar';

export const TaskBoard = ({ onProfileClick }: TaskBoardProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'list' : 'board');
  const [showArchived, setShowArchived] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [projectSwitcherOpen, setProjectSwitcherOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<Stage>("To Do");
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [columnSortConfigs, setColumnSortConfigs] = useState<ColumnSortConfig>({});
  const { currentProject, projects, refetchProjects } = useProject();
  
  const {
    tasks,
    activeId,
    stages,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleTaskCreate,
    handleTaskUpdate,
    handleTaskArchive,
    isLoading
  } = useTaskBoard(currentProject?.id);

  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task);
    setSidebarOpen(true);
  };

  const handleAddTask = (stage: Stage) => {
    setSelectedTask(null);
    setSelectedStage(stage);
    setSidebarOpen(true);
  };

  const handleSort = (stage: Stage, field: SortField, direction: SortDirection) => {
    setColumnSortConfigs(prev => ({
      ...prev,
      [stage]: { field, direction }
    }));
  };

  const getSortedTasks = (stage: Stage, tasksToSort: TaskType[]) => {
    const sortConfig = columnSortConfigs[stage];
    if (!sortConfig) return tasksToSort;

    return [...tasksToSort].sort((a, b) => {
      const { field, direction } = sortConfig;
      const multiplier = direction === 'asc' ? 1 : -1;

      switch (field) {
        case 'title':
          return multiplier * a.title.localeCompare(b.title);
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return multiplier * (priorityOrder[a.priority] - priorityOrder[b.priority]);
        }
        case 'assignee':
          return multiplier * (a.assignee || '').localeCompare(b.assignee || '');
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return multiplier;
          if (!b.due_date) return -multiplier;
          return multiplier * new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'created_at':
          return multiplier * new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'updated_at':
          if (!a.updated_at || !b.updated_at) return 0;
          return multiplier * new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        default:
          return 0;
      }
    });
  };

  const filteredTasks = tasks.filter(task => showArchived ? task.archived : !task.archived);

  if (projects.length === 0) {
    return (
      <>
        <NoProjectsFound onCreateProject={() => setCreateProjectOpen(true)} />
        <ProjectDialog
          open={createProjectOpen}
          onOpenChange={setCreateProjectOpen}
          onProjectCreated={refetchProjects}
          mode="create"
        />
      </>
    );
  }

  if (isLoading && currentProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b p-4 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DropdownMenu open={projectSwitcherOpen} onOpenChange={setProjectSwitcherOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <h1 className="text-2xl font-bold">{currentProject?.name}</h1>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenu>
            {currentProject?.role === 'owner' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMembersDialogOpen(true)}
                className="h-8 w-8"
              >
                <Users className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex gap-2 items-center w-full md:w-auto justify-between md:justify-end">
            <ViewSwitcher
              viewMode={viewMode}
              setViewMode={setViewMode}
              onAddTask={() => handleAddTask("To Do")}
            />
            <div className="flex items-center gap-1">
              <Button
                variant={showArchived ? 'default' : 'outline'}
                size={isMobile ? 'icon' : 'sm'}
                onClick={() => setShowArchived(!showArchived)}
                className="h-8 w-8 md:h-9 md:w-auto bg-white text-black hover:bg-gray-100 hover:text-black"
              >
                <Archive className="h-4 w-4" />
                {!isMobile && <span className="ml-2">{showArchived ? t('common.hideArchived') : t('common.showArchived')}</span>}
              </Button>
              <UserMenu onProfileClick={onProfileClick} />
            </div>
          </div>
        </div>

        <TaskProgress tasks={filteredTasks} />
      </div>

      <div className="relative p-4">
        {viewMode === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-6">
            <DndContext
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              {stages.map((stage) => {
                const stageTasks = filteredTasks.filter((task) => task.stage === stage);
                const sortedTasks = getSortedTasks(stage, stageTasks);
                const sortConfig = columnSortConfigs[stage];

                return (
                  <Column
                    key={stage}
                    id={stage}
                    title={stage}
                    tasks={sortedTasks}
                    onAddTask={() => handleAddTask(stage)}
                    onTaskClick={handleTaskClick}
                    onSort={(field, direction) => handleSort(stage, field, direction)}
                    sortField={sortConfig?.field}
                    sortDirection={sortConfig?.direction}
                  />
                );
              })}

              <DragOverlay>
                {activeId ? (
                  <Task
                    task={tasks.find(task => task.id === activeId)!}
                    onTaskClick={handleTaskClick}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        ) : viewMode === 'list' ? (
          <ListView
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onTaskUpdate={handleTaskUpdate}
          />
        ) : (
          <CalendarView
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onTaskUpdate={handleTaskUpdate}
          />
        )}

        {isMobile && (
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white"
            onClick={() => handleAddTask("To Do")}
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </div>

      <TaskSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        onTaskCreate={handleTaskCreate}
        onTaskUpdate={handleTaskUpdate}
        onTaskArchive={handleTaskArchive}
        defaultStage={selectedStage}
        task={selectedTask}
      />

      <ProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onProjectCreated={refetchProjects}
        mode="create"
      />
      <ProjectSwitcher
        open={projectSwitcherOpen}
        onOpenChange={setProjectSwitcherOpen}
        projects={projects}
      />

      {currentProject && (
        <ProjectMembersDialog
          open={membersDialogOpen}
          onOpenChange={setMembersDialogOpen}
          projectId={currentProject.id}
        />
      )}
    </div>
  );
};
