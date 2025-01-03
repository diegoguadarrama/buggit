import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Column } from './Column';
import { Task } from './Task';
import { Button } from '@/components/ui/button';
import { Plus, Users, LayoutList, KanbanSquare, Archive, GanttChartSquare } from 'lucide-react';
import { TaskSidebar } from './TaskSidebar';
import { UserMenu } from './UserMenu';
import { useProject } from './ProjectContext';
import { ProjectDialog } from './ProjectDialog';
import { NoProjectsFound } from './NoProjectsFound';
import { useTaskBoard } from './useTaskBoard';
import { ProjectMembersDialog } from './ProjectMembersDialog';
import { ProjectSwitcher } from './ProjectSwitcher';
import { ListView } from './ListView';
import { GanttView } from './GanttView';
import type { TaskType, Stage } from '@/types/task';

interface TaskBoardProps {
  onProfileClick: () => void;
}

type ViewMode = 'board' | 'list' | 'gantt';

export const TaskBoard = ({ onProfileClick }: TaskBoardProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('board');
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
    console.log('TaskBoard handleTaskClick called with task:', task);
    setSelectedTask(task);
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

  const handleAddTask = (stage: Stage) => {
    setSelectedTask(null);
    setSelectedStage(stage);
    setSidebarOpen(true);
  };

  return (
    <div className="p-6 relative min-h-screen pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div className="flex flex-col w-full md:w-auto">
          <div className="flex items-center">
            <ProjectSwitcher />
          </div>
          {currentProject?.description && (
            <p className="text-gray-600 mt-2 text-sm max-w-xl">
              {currentProject.description}
            </p>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex gap-4 items-center ml-4">
          <div className="flex gap-2 border rounded-lg p-1">
            <Button
              variant={viewMode === 'board' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('board')}
            >
              <KanbanSquare className="h-4 w-4 mr-2" />
              Board
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'gantt' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('gantt')}
            >
              <GanttChartSquare className="h-4 w-4 mr-2" />
              Gantt
            </Button>
          </div>
          <Button
            variant={showArchived ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4 mr-2" />
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
          <Button onClick={() => handleAddTask("To Do")}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
          <Button variant="outline" onClick={() => setMembersDialogOpen(true)}>
            <Users className="mr-2 h-4 w-4" /> Members
          </Button>
          <UserMenu onProfileClick={onProfileClick} />
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden w-full gap-2">
          <div className="flex gap-2 border rounded-lg p-1 flex-1">
            <Button
              variant={viewMode === 'board' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setViewMode('board')}
            >
              <KanbanSquare className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'gantt' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setViewMode('gantt')}
            >
              <GanttChartSquare className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant={showArchived ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMembersDialogOpen(true)}
          >
            <Users className="h-4 w-4" />
          </Button>
          <UserMenu onProfileClick={onProfileClick} />
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  isDragging
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
        <GanttView 
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
        />
      )}

      {/* Floating Add Task Button (Mobile Only) */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => handleAddTask("To Do")}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
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
