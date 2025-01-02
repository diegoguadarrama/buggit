import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Column } from './Column';
import { Task } from './Task';
import { Button } from '@/components/ui/button';
import { Plus, Users, LayoutList, KanbanSquare } from 'lucide-react';
import { TaskSidebar } from './TaskSidebar';
import { UserMenu } from './UserMenu';
import { useProject } from './ProjectContext';
import { ProjectDialog } from './ProjectDialog';
import { NoProjectsFound } from './NoProjectsFound';
import { useTaskBoard } from './useTaskBoard';
import { ProjectMembersDialog } from './ProjectMembersDialog';
import { ProjectSwitcher } from './ProjectSwitcher';
import { ListView } from './ListView';
import type { TaskType, Stage } from '@/types/task';

interface TaskBoardProps {
  onProfileClick: () => void;
}

type ViewMode = 'board' | 'list';

export const TaskBoard = ({ onProfileClick }: TaskBoardProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('board');
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
    <div className="p-6">
      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col">
          <div className="flex items-center">
            <ProjectSwitcher />
          </div>
          {currentProject?.description && (
            <p className="text-gray-600 mt-2 text-sm max-w-xl">
              {currentProject.description}
            </p>
          )}
        </div>
        <div className="flex gap-4 items-center ml-4">
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
          </div>
          <Button onClick={() => handleAddTask("To Do")}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
          <Button variant="outline" onClick={() => setMembersDialogOpen(true)}>
            <Users className="mr-2 h-4 w-4" /> Members
          </Button>
          <UserMenu onProfileClick={onProfileClick} />
        </div>
      </div>

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
                tasks={tasks.filter((task) => task.stage === stage)}
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
      ) : (
        <ListView 
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onTaskUpdate={handleTaskUpdate}
        />
      )}

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