import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Column } from './Column';
import { Task } from './Task';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskSidebar } from './TaskSidebar';
import { UserMenu } from './UserMenu';
import { useProject } from './ProjectContext';
import { CreateProjectDialog } from './CreateProjectDialog';
import { NoProjectsFound } from './NoProjectsFound';
import { useTaskBoard } from './useTaskBoard';

interface TaskBoardProps {
  onProfileClick: () => void;
}

export const TaskBoard = ({ onProfileClick }: TaskBoardProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("To Do");
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
    isLoading
  } = useTaskBoard(currentProject?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <>
        <NoProjectsFound onCreateProject={() => setCreateProjectOpen(true)} />
        <CreateProjectDialog
          open={createProjectOpen}
          onOpenChange={setCreateProjectOpen}
          onProjectCreated={refetchProjects}
        />
      </>
    );
  }

  const handleAddTask = (stage: string) => {
    setSelectedStage(stage);
    setSidebarOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{currentProject?.name}</h1>
          <p className="text-gray-600">{currentProject?.description}</p>
        </div>
        <div className="flex gap-4 items-center">
          <Button onClick={() => handleAddTask("To Do")}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
          <UserMenu onProfileClick={onProfileClick} />
        </div>
      </div>

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
            />
          ))}

          <DragOverlay>
            {activeId ? (
              <Task
                task={tasks.find((task) => task.id === activeId)!}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        onTaskCreate={handleTaskCreate}
        defaultStage={selectedStage}
      />

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onProjectCreated={refetchProjects}
      />
    </div>
  );
};