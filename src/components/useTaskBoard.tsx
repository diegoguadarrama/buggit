import { useState, useEffect } from 'react';
import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Priority, TaskType } from '@/types/task';

const stages = ['To Do', 'In Progress', 'Done'];

const isPriority = (value: string): value is Priority => {
  return ['low', 'medium', 'high'].includes(value);
};

const transformSupabaseTask = (task: any): TaskType => {
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

export const useTaskBoard = (projectId: string | undefined) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching tasks",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }

      return (data as any[]).map(transformSupabaseTask);
    },
    enabled: !!projectId,
  });

  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, projectId]);

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

  const handleTaskCreate = async (task: TaskType) => {
    if (!user || !projectId) return;

    const { error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: user.id, project_id: projectId }]);

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
    isLoading,
  };
};
