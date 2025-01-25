import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/components/UserContext';
import type { TaskType, Stage } from '@/types/task';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';

export const stages: Stage[] = ['To Do', 'In Progress', 'Done'];

const transformSupabaseTask = (task: any): TaskType => ({
  id: task.id,
  title: task.title,
  description: task.description,
  priority: task.priority,
  stage: task.stage as Stage,
  assignee: task.assignee || 'unassigned',
  attachments: task.attachments,
  created_at: task.created_at,
  updated_at: task.updated_at,
  due_date: task.due_date,
  archived: task.archived || false,
  project_id: task.project_id,
  user_id: task.user_id,
  position: Math.floor(task.position || 0)
});

export const useTaskBoard = (projectId: string | undefined) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewStage, setPreviewStage] = useState<Stage | null>(null);
  const { user } = useUser();
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
        .order('position', { ascending: true });

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(task => task.id === active.id);
    if (!activeTask) return;

    const overId = over.id;
    if (stages.includes(overId as Stage)) {
      setPreviewStage(overId as Stage);
    } else {
      const overTask = tasks.find(task => task.id === overId);
      if (overTask) {
        setPreviewStage(overTask.stage);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setPreviewStage(null);

    if (!over || !active) return;

    const activeTask = tasks.find(task => task.id === active.id);
    if (!activeTask || !projectId) return;

    let targetStage = activeTask.stage;
    let targetPosition = activeTask.position;

    try {
      console.log('Starting drag end operation:', {
        activeTaskId: activeTask.id,
        currentStage: activeTask.stage,
        currentPosition: activeTask.position
      });

      // If dropping over a stage
      if (stages.includes(over.id as Stage)) {
        targetStage = over.id as Stage;
        const tasksInStage = tasks.filter(t => t.stage === targetStage);
        
        console.log('Tasks in target stage before update:', tasksInStage.map(t => ({
          id: t.id,
          position: t.position,
          stage: t.stage
        })));
        
        // Calculate new position ensuring it's unique
        if (tasksInStage.length > 0) {
          const maxPosition = Math.max(...tasksInStage.map(t => t.position));
          targetPosition = maxPosition + 1000;
        } else {
          targetPosition = 1000;
        }

        console.log('Calculated new position:', {
          targetStage,
          targetPosition,
          existingPositions: tasksInStage.map(t => t.position)
        });

        const { error } = await supabase
          .from('tasks')
          .update({ 
            stage: targetStage,
            position: targetPosition,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeTask.id)
          .eq('project_id', projectId);

        if (error) throw error;
      } 
      // If dropping over another task
      else {
        const overTask = tasks.find(task => task.id === over.id);
        if (!overTask) return;
        
        console.log('Dropping over task:', {
          overTaskId: overTask.id,
          overTaskStage: overTask.stage,
          overTaskPosition: overTask.position
        });

        targetStage = overTask.stage;
        const tasksInStage = tasks.filter(t => t.stage === targetStage);
        const overTaskIndex = tasksInStage.findIndex(t => t.id === overTask.id);

        // Calculate new position ensuring it's unique
        if (overTaskIndex === 0) {
          // If dropping before the first task
          targetPosition = overTask.position - 1000;
        } else if (overTaskIndex === tasksInStage.length - 1) {
          // If dropping after the last task
          targetPosition = overTask.position + 1000;
        } else {
          // If dropping between tasks, find a position between them
          const prevTask = tasksInStage[overTaskIndex - 1];
          targetPosition = Math.floor((prevTask.position + overTask.position) / 2);
        }

        console.log('Calculated position for task between others:', {
          targetPosition,
          prevPosition: tasksInStage[overTaskIndex - 1]?.position,
          nextPosition: overTask.position
        });

        const { error } = await supabase
          .from('tasks')
          .update({ 
            stage: targetStage,
            position: targetPosition,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeTask.id)
          .eq('project_id', projectId);

        if (error) throw error;
      }

      // Optimistically update the UI
      queryClient.setQueryData(['tasks', projectId], (oldTasks: TaskType[] | undefined) => {
        if (!oldTasks) return oldTasks;
        return oldTasks.map(task => 
          task.id === activeTask.id 
            ? { ...task, stage: targetStage, position: targetPosition }
            : task
        );
      });

    } catch (error: any) {
      console.error('Error updating task stage and position:', {
        error,
        taskDetails: {
          taskId: activeTask.id,
          fromStage: activeTask.stage,
          toStage: targetStage,
          fromPosition: activeTask.position,
          toPosition: targetPosition
        },
        allTaskPositions: tasks
          .filter(t => t.stage === targetStage)
          .map(t => ({
            id: t.id,
            position: t.position
          }))
      });
      
      toast({
        title: "Error moving task",
        description: error.message,
        variant: "destructive"
      });
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setPreviewStage(null);
  };

  const handleTaskCreate = async (taskData: Partial<TaskType>): Promise<TaskType | null> => {
    if (!projectId || !user) return null;

    const newTask = {
      ...taskData,
      project_id: projectId,
      user_id: user.id,
      assignee: taskData.assignee || 'unassigned',
      priority: taskData.priority || 'medium',
      stage: taskData.stage || 'To Do',
      title: taskData.title || '',
    };

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;

      const createdTask = transformSupabaseTask(data);
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      return createdTask;
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const handleTaskUpdate = async (task: TaskType): Promise<void> => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: task.title,
          description: task.description,
          priority: task.priority,
          stage: task.stage,
          assignee: task.assignee,
          attachments: task.attachments,
          due_date: task.due_date,
          archived: task.archived,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task.id)
        .eq('project_id', projectId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleTaskArchive = async (taskId: string): Promise<void> => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ archived: true })
        .eq('id', taskId)
        .eq('project_id', projectId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    } catch (error: any) {
      console.error('Error archiving task:', error);
      toast({
        title: "Error archiving task",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    tasks,
    activeId,
    stages,
    previewStage,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleTaskCreate,
    handleTaskUpdate,
    handleTaskArchive,
    isLoading
  };
};