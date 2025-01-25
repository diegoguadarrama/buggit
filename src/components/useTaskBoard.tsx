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

  const swapTaskPositions = async (
    task1: TaskType,
    task2: TaskType,
    projectId: string
  ): Promise<void> => {
    console.log('Swapping positions between tasks:', {
      task1: { id: task1.id, position: task1.position, stage: task1.stage },
      task2: { id: task2.id, position: task2.position, stage: task2.stage }
    });

    // First, update task1 to a temporary position that's guaranteed to be unique
    const tempPosition = -1;
    
    const { error: tempError } = await supabase
      .from('tasks')
      .update({ 
        position: tempPosition,
        updated_at: new Date().toISOString()
      })
      .eq('id', task1.id)
      .eq('project_id', projectId);

    if (tempError) {
      console.error('Error setting temporary position:', tempError);
      throw tempError;
    }

    // Then update task2 with task1's original position
    const { error: error2 } = await supabase
      .from('tasks')
      .update({ 
        position: task1.position,
        updated_at: new Date().toISOString()
      })
      .eq('id', task2.id)
      .eq('project_id', projectId);

    if (error2) {
      // Revert task1's position if task2 update fails
      await supabase
        .from('tasks')
        .update({ 
          position: task1.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', task1.id)
        .eq('project_id', projectId);
      
      throw error2;
    }

    // Finally, update task1 with task2's original position
    const { error: error1 } = await supabase
      .from('tasks')
      .update({ 
        position: task2.position,
        updated_at: new Date().toISOString()
      })
      .eq('id', task1.id)
      .eq('project_id', projectId);

    if (error1) {
      // Attempt to revert both tasks if final update fails
      await supabase
        .from('tasks')
        .update({ 
          position: task2.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', task2.id)
        .eq('project_id', projectId);

      await supabase
        .from('tasks')
        .update({ 
          position: task1.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', task1.id)
        .eq('project_id', projectId);
        
      throw error1;
    }
  };

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

    const draggedNote = allNotes.find(note => note.id === active.id);
    if (!draggedNote) return;

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
        
        targetPosition = tasksInStage.length > 0 
          ? Math.max(...tasksInStage.map(t => t.position)) + 1000
          : 1000;

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
        targetPosition = overTask.position;

        if (activeTask.stage === overTask.stage) {
          // Same stage, swap positions
          console.log('Swapping positions in same stage:', {
            task1: { id: activeTask.id, position: activeTask.position },
            task2: { id: overTask.id, position: overTask.position }
          });

          const taskUpdates = [
            {
              task_id: activeTask.id.toString(), // Convert UUID to string
              project_id: projectId.toString(), // Convert UUID to string
              new_position: overTask.position,
              new_stage: targetStage
            },
            {
              task_id: overTask.id.toString(), // Convert UUID to string
              project_id: projectId.toString(), // Convert UUID to string
              new_position: activeTask.position,
              new_stage: targetStage
            }
          ];

          console.log('Task updates:', taskUpdates);

          const { error } = await supabase
            .rpc('update_task_positions', { task_updates: taskUpdates });

          if (error) {
            console.error('Error in update_task_positions:', error);
            throw error;
          }
        } else {
          // Different stage, update stage and position
          console.log('Moving to different stage:', {
            fromStage: activeTask.stage,
            toStage: targetStage,
            newPosition: targetPosition
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
    } finally {
      setActiveId(null);
      setPreviewStage(null);
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