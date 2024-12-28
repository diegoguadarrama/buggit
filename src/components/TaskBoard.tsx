import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Column } from './Column';
import { Task } from './Task';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { TaskSidebar } from './TaskSidebar';
import { UserMenu } from './UserMenu';
import { useProject } from './ProjectContext';
import { CreateProjectDialog } from './CreateProjectDialog';
import { NoProjectsFound } from './NoProjectsFound';
import { useTaskBoard } from './useTaskBoard';
import { ProjectMembersDialog } from './ProjectMembersDialog';
import { ProjectSwitcher } from './ProjectSwitcher';
import type { TaskType } from '@/types/task';

interface TaskBoardProps {
  onProfileClick: () => void;
}

export const TaskBoard = ({ onProfileClick }: TaskBoardProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("To Do");
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
    isLoading
  } = useTaskBoard(currentProject?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentProject && projects.length === 0) {
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
    setSelectedTask(null);
    setSelectedStage(stage);
    setSidebarOpen(true);
  };

  const handleTaskUpdate = (updatedTask: TaskType) => {
  // Update the tasks array with the updated task
  
    const updatedTasks = tasks.map(t => 
    t.id === updatedTask.id ? updatedTask : t
  );
  // You'll need to add this function to your useTaskBoard hook
  // or wherever you're managing your tasks state
  updateTasks(updatedTasks);
};
  const handleTaskClick = (task: TaskType) => {
    console.log('Task clicked:', task);
    setSelectedTask(task);
    setSidebarOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <ProjectSwitcher />
          <p className="text-gray-600 mt-1">{currentProject?.description}</p>
        </div>
        <div className="flex gap-4 items-center">
          <Button onClick={() => handleAddTask("To Do")}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
          <Button variant="outline" onClick={() => setMembersDialogOpen(true)}>
            <Users className="mr-2 h-4 w-4" /> Members
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
              onTaskClick={handleTaskClick}
            />
          ))}

          <DragOverlay>
            {activeId ? (
              <Task
                task={tasks.find(task => task.id === activeId)!}
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
        task={selectedTask}
      />

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onProjectCreated={refetchProjects}
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
