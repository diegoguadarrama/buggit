import { useState, useRef } from 'react';
import { Column } from './Column';
import { Task } from './Task';
import { Button } from '@/components/ui/button';
import { Plus, Users, LayoutList, KanbanSquare, Archive } from 'lucide-react';
import { TaskSidebar } from './TaskSidebar';
import { UserMenu } from './UserMenu';
import { useProject } from './ProjectContext';
import { CreateTaskDialog } from './CreateTaskDialog';
import { ProjectMembersDialog } from './ProjectMembersDialog';
import { ProjectSwitcher } from './ProjectSwitcher';
import { ListView } from './ListView';
import type { TaskType, Stage } from '@/types/task';
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTaskBoard } from './useTaskBoard';
import { useMobile } from '@/hooks/use-mobile';

interface TaskBoardProps {
  onProfileClick: () => void;
}

type ViewMode = 'board' | 'list';

export const TaskBoard = ({ onProfileClick }: TaskBoardProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const { currentProject } = useProject();
  const isMobile = useMobile();
  const {
    tasks,
    stages,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleTaskCreate,
    handleTaskUpdate,
    handleTaskDelete,
    handleTaskArchive,
    activeId,
    isLoading,
  } = useTaskBoard(currentProject?.id);

  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task);
  };

  const filteredTasks = tasks.filter(task => showArchived || !task.archived);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <ProjectSwitcher />
          <Button variant="outline" size="sm" onClick={() => setShowMembers(true)}>
            <Users className="h-4 w-4 mr-2" />
            Members
          </Button>
        </div>
        {!isMobile ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
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
            <Button
              variant={showArchived ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="h-4 w-4 mr-2" />
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </Button>
            <Button size="sm" onClick={() => setShowCreateTask(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
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
            </div>
            <Button
              variant={showArchived ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setShowCreateTask(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        <UserMenu onProfileClick={onProfileClick} />
      </div>

      {viewMode === 'board' ? (
        <div className="flex-1 overflow-x-auto">
          <DndContext
            sensors={useSensors(
              useSensor(PointerSensor),
              useSensor(KeyboardSensor, {
                coordinateGetter: sortableKeyboardCoordinates,
              })
            )}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex gap-4 p-4 h-full">
              {stages.map((stage) => (
                <Column
                  key={stage}
                  id={stage}
                  title={stage}
                  tasks={filteredTasks.filter((task) => task.stage === stage)}
                  onAddTask={() => setShowCreateTask(true)}
                  onTaskClick={handleTaskClick}
                />
              ))}
            </div>

            <DragOverlay>
              {activeId ? (
                <Task
                  key={activeId}
                  task={tasks.find((task) => task.id === activeId)!}
                  onTaskClick={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      ) : (
        <ListView 
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
          onTaskUpdate={handleTaskUpdate}
        />
      )}

      {selectedTask && (
        <TaskSidebar
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          task={selectedTask}
          onTaskCreate={handleTaskCreate}
          onTaskUpdate={handleTaskUpdate}
          defaultStage={selectedTask.stage}
          onTaskArchive={handleTaskArchive}
        />
      )}

      {showCreateTask && (
        <CreateTaskDialog
          open={showCreateTask}
          onOpenChange={setShowCreateTask}
          onTaskCreate={handleTaskCreate}
        />
      )}

      {showMembers && (
        <ProjectMembersDialog
          open={showMembers}
          onOpenChange={setShowMembers}
          projectId={currentProject?.id}
        />
      )}
    </div>
  );
};