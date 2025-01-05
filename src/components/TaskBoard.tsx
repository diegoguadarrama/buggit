import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Column } from './Column';
import { Task } from './Task';
import { Button } from '@/components/ui/button';
import { Plus, Users, Archive } from 'lucide-react';
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
  const [selectedStage, setSelectedStage] = useState<Stage>("To Do");
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
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

  const filteredTasks = tasks.filter(task => showArchived ? task.archived : !task.archived);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!currentProject && projects.length === 0) {
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

  return (
    <div className="p-2 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-8 gap-4">
        <div className="flex flex-col w-full md:w-auto">
          <div className="flex items-center justify-between md:justify-start gap-2">
            <div className="flex items-center gap-1">
              <ProjectSwitcher />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMembersDialogOpen(true)}
                className="h-8 w-8"
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {currentProject?.description && (
            <p className="text-gray-600 mt-2 text-sm max-w-xl hidden md:block">
              {currentProject.description}
            </p>
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
              className="h-8 w-8 md:h-9 md:w-auto"
            >
              <Archive className="h-4 w-4" />
              {!isMobile && <span className="ml-2">{showArchived ? t('common.hideArchived') : t('common.showArchived')}</span>}
            </Button>
            <UserMenu onProfileClick={onProfileClick} />
          </div>
        </div>
      </div>

      <TaskProgress tasks={filteredTasks} />

      <div className="relative">
        {viewMode === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pb-20 md:pb-6">
            <DndContext
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              {stages.map((stage) => (
                <Column
                  key={stage}
                  id={stage}
                  title={stage}
                  tasks={filteredTasks.filter((task) => task.stage === stage)}
                  onAddTask={() => handleAddTask(stage)}
                  onTaskClick={handleTaskClick}
                />
              ))}

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
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
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
