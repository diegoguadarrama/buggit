import { useState } from 'react';
import { DragEndEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Priority, TaskType } from '@/types/task';

export const stages = ["To Do", "In Progress", "Done"] as const;
type Stage = typeof stages[number];

const isPriority = (value: string): value is Priority => {
  return ['low', 'medium', 'high'].includes(value);
};

const transformSupabaseTask = (task: any): TaskType => {
  return {
    ...task,
    priority: isPriority(task.priority) ? task.priority : 'low',
    attachments: task.attachments || [],
  };
};

export const useTaskBoard = (projectId: string | undefined) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      console.log('Fetching tasks for project:', projectId);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error fetching tasks",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }

      return data.map(transformSupabaseTask);
    },
    enabled: !!projectId,
  });

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic here
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find(task => task.id === active.id);
    const overContainer = over.id;

    if (!activeTask || activeTask.stage === overContainer) return;

    // Ensure the stage is one of the valid stages
    const newStage = overContainer.toString();
    if (!stages.includes(newStage as Stage)) {
      console.error('Invalid stage:', newStage);
      return;
    }

    const updatedTask = {
      ...activeTask,
      stage: newStage
    };

    // Optimistically update the UI
    queryClient.setQueryData(['tasks', projectId], (oldTasks: TaskType[] | undefined) => {
      if (!oldTasks) return [];
      return oldTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
    });

    // Update the database
    const { error } = await supabase
      .from('tasks')
      .update({ stage: newStage })
      .eq('id', active.id)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error updating task stage:', error);
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive"
      });
      // Revert the optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleTaskCreate = async (newTask: Partial<TaskType>) => {
    if (!user || !projectId) return;

    // Ensure the stage is valid
    const stage = (newTask.stage || 'To Do') as Stage;
    if (!stages.includes(stage)) {
      console.error('Invalid stage:', stage);
      return null;
    }

    const taskToInsert = {
      ...newTask,
      user_id: user.id,
      project_id: projectId,
      title: newTask.title || '',
      priority: newTask.priority || 'low',
      stage,
      assignee: newTask.assignee || '',
      attachments: newTask.attachments || [],
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    // Invalidate and refetch tasks
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    return transformSupabaseTask(data);
  };

  const handleTaskUpdate = async (updatedTask: TaskType) => {
    if (!projectId) return;

    // Ensure the stage is valid
    if (!stages.includes(updatedTask.stage as Stage)) {
      console.error('Invalid stage:', updatedTask.stage);
      return;
    }

    // Optimistically update the UI
    queryClient.setQueryData(['tasks', projectId], (oldTasks: TaskType[] | undefined) => {
      if (!oldTasks) return [];
      return oldTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
    });

    // Update the database
    const { error } = await supabase
      .from('tasks')
      .update({
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        stage: updatedTask.stage,
        assignee: updatedTask.assignee,
        attachments: updatedTask.attachments,
        due_date: updatedTask.due_date,
      })
      .eq('id', updatedTask.id)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive"
      });
      // Revert the optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    }
  };

  return {
    tasks,
    activeId,
    stages,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleTaskCreate,
    handleTaskUpdate,
    isLoading,
  };
};