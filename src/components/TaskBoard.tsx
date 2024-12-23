import { DndContext, DragOverlay, closestCorners, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { Column } from './Column';
import { Task } from './Task';
import { Button } from '@/components/ui/button';
import { LogOut, Plus } from 'lucide-react';
import { TaskSidebar } from './TaskSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export type Priority = 'low' | 'medium' | 'high';

export interface TaskType {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  stage: string;
  assignee: string;
  attachments: string[];
}

interface SupabaseTask extends Omit<TaskType, 'priority'> {
  priority: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const stages = ['To Do', 'In Progress', 'Done'];

const isPriority = (value: string): value is Priority => {
  return ['low', 'medium', 'high'].includes(value);
};

const transformSupabaseTask = (task: SupabaseTask): TaskType => {
  const priority = isPriority(task.priority) ? task.priority : 'low';
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority,
    stage: task.stage,
    assignee: task.assignee,
    attachments: task.attachments || [],
  };
};

export const TaskBoard = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching tasks",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }

      return (data as SupabaseTask[]).map(transformSupabaseTask);
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = async (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(task => task.id === active.id);
    const overTask = tasks.find(task => task.id === over.id);

    if (!activeTask) return;

    if (overTask) {
      const activeStage = activeTask.stage;
      const overStage = overTask.stage;

      if (activeStage !== overStage) {
        const { error } = await supabase
          .from('tasks')
          .update({ stage: overStage })
          .eq('id', activeTask.id);

        if (error) {
          toast({
            title: "Error updating task",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    } else if (typeof over.id === 'string' && stages.includes(over.id)) {
      const { error } = await supabase
        .from('tasks')
        .update({ stage: over.id })
        .eq('id', activeTask.id);

      if (error) {
        toast({
          title: "Error updating task",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Task Board</h1>
          <p className="text-sm text-gray-600">Welcome, {user?.email}</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setSidebarOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
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
              onAddTask={() => setSidebarOpen(true)}
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
        onTaskCreate={async (task) => {
          const { error } = await supabase
            .from('tasks')
            .insert([{ ...task, user_id: user?.id }]);

          if (error) {
            toast({
              title: "Error creating task",
              description: error.message,
              variant: "destructive"
            });
          } else {
            toast({
              title: "Task created",
              description: "Your task has been created successfully.",
            });
          }
        }}
      />
    </div>
  );
};