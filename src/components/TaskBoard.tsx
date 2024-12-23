import { DndContext, DragOverlay, closestCorners, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import { Column } from './Column';
import { Task } from './Task';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateTaskDialog } from './CreateTaskDialog';

export interface TaskType {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  stage: string;
  assignee: string;
  attachments: string[];
}

const stages = ['To Do', 'In Progress', 'Done'];

export const TaskBoard = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(task => task.id === active.id);
    const overTask = tasks.find(task => task.id === over.id);

    if (!activeTask) return;

    // If dropping over another task
    if (overTask) {
      const activeStage = activeTask.stage;
      const overStage = overTask.stage;

      if (activeStage !== overStage) {
        setTasks(tasks => {
          return tasks.map(task => {
            if (task.id === activeTask.id) {
              return { ...task, stage: overStage };
            }
            return task;
          });
        });
      }
    }
    // If dropping over an empty column
    else if (typeof over.id === 'string' && stages.includes(over.id)) {
      setTasks(tasks => {
        return tasks.map(task => {
          if (task.id === activeTask.id) {
            return { ...task, stage: over.id };
          }
          return task;
        });
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setTasks((tasks) => {
        const oldIndex = tasks.findIndex((task) => task.id === active.id);
        const newIndex = tasks.findIndex((task) => task.id === over.id);
        
        return arrayMove(tasks, oldIndex, newIndex);
      });
    }
    
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const addTask = (task: TaskType) => {
    setTasks([...tasks, task]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
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
              onAddTask={() => setCreateDialogOpen(true)}
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

      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onTaskCreate={addTask}
      />
    </div>
  );
};