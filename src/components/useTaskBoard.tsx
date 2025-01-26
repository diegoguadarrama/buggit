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

  // Helper function to determine placement relative to the target task
  const getPlacementRelativeToOverTask = (
  event: DragOverEvent,
  ): "before" | "after" => {
    const { collision } = event;
    if (!collision?.translateRect) return "before"; // Fallback
  
    // Use the collision's translateRect for accurate bounds
    const { top, height } = collision.translateRect;
    const cursorY = collision.point.y;
    const elementCenterY = top + height / 2;
  
    // Add a small threshold for edge cases (e.g., cursor exactly at center)
    return cursorY < elementCenterY - 1 ? "before" : "after";
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
      console.log('Starting drag end handler:', { active, over });

      // If dropping over a stage
      if (stages.includes(over.id as Stage)) {
        targetStage = over.id as Stage;
        const tasksInTargetStage = tasks.filter(t => t.stage === targetStage);
        
        // Calculate new position for empty stage or end of stage
        targetPosition = tasksInTargetStage.length > 0
          ? Math.max(...tasksInTargetStage.map(t => t.position)) + 1000
          : 1000; // Default position for empty stage

        console.log('Dropping over stage:', {
          targetStage,
          targetPosition,
          tasksInStageCount: tasksInTargetStage.length
        });
      }
      // If dropping over another task
      else {
        const overTask = tasks.find(task => task.id === over.id);
        if (!overTask) return;
        
        targetStage = overTask.stage;
        const tasksInStage = tasks.filter(t => t.stage === targetStage);
        const overTaskIndex = tasksInStage.findIndex(t => t.id === overTask.id);
        const activeTaskIndex = tasksInStage.findIndex(t => t.id === activeTask.id);
        const isAdjacentSwap = activeTaskIndex !== -1 && Math.abs(overTaskIndex - activeTaskIndex) === 1;
        
        // Calculate placement (using cursor position or other logic)
        const placement = getPlacementRelativeToOverTask(overTask, activeTask); // Update this function if needed
        
          // Existing midpoint logic
          if (overTaskIndex === 0) {
            targetPosition = overTask.position - 1;
          } else if (overTaskIndex === tasksInStage.length - 1) {
            targetPosition = overTask.position + 1;
          } else {
            if (isAdjacentSwap) {
            // Handle adjacent swap logic
            if (placement === "before") {
            targetPosition = overTask.position - 1;
          } else {
            targetPosition = overTask.position + 1;
          } 
            }
          }

        console.log('Dropping over task:', {
          targetStage,
          targetPosition,
          overTaskIndex,
          overTaskPosition: overTask.position
        });
      }

      // Optimistically update the UI
      const updatedTasks = tasks.map(task => {
        if (task.id === activeTask.id) {
          return { ...task, stage: targetStage, position: targetPosition };
        }
        return task;
      }).sort((a, b) => a.position - b.position);

      queryClient.setQueryData(['tasks', projectId], updatedTasks);

      console.log('Updating task in database:', {
        taskId: activeTask.id,
        newStage: targetStage,
        newPosition: targetPosition
      });

      // Make the API call
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

      // Refetch to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });

    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: "Error moving task",
        description: error.message,
        variant: "destructive"
      });
      // Revert optimistic update and refetch
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
