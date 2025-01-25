import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/components/UserContext';
import type { TaskType, Stage } from '@/types/task';
import type { DragEndEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core';

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setPreviewStage(null);
    
    if (!over || !projectId) return;

    const activeTask = tasks.find(task => task.id === active.id);
    if (!activeTask) return;

    const overId = over.id;
    try {
      let targetStage: Stage;
      let overTask: TaskType | undefined;
      
      if (stages.includes(overId as Stage)) {
        targetStage = overId as Stage;
        const stageTasks = tasks
          .filter(t => t.stage === targetStage && t.project_id === projectId)
          .sort((a, b) => (a.position || 0) - (b.position || 0));
        
        if (stageTasks.length > 0) {
          // If dropping at the end of a stage, use the last task
          overTask = stageTasks[stageTasks.length - 1];
        }
      } else {
        overTask = tasks.find(task => task.id === overId);
        if (!overTask) return;
        targetStage = overTask.stage;
      }

      // First update stage if it changed
      if (targetStage !== activeTask.stage) {
        console.log('Updating task stage:', {
          taskId: activeTask.id,
          fromStage: activeTask.stage,
          toStage: targetStage
        });

        const { error: stageError } = await supabase
          .from('tasks')
          .update({
            stage: targetStage,
            updated_at: new Date().toISOString()
          })
          .eq('id', activeTask.id)
          .eq('project_id', projectId);

        if (stageError) throw stageError;

        // Update the local task stage before position swap
        activeTask.stage = targetStage;
      }

      // Then handle position swap if needed
      if (overTask && overTask.id !== activeTask.id) {
        console.log('Swapping positions:', {
          activeTask: { id: activeTask.id, position: activeTask.position },
          overTask: { id: overTask.id, position: overTask.position }
        });
        await swapTaskPositions(activeTask, overTask, projectId);
      }

      // Refresh the task list
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });

    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive"
      });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    }
  };

  return {
    tasks: tasks.sort((a, b) => (a.position || 0) - (b.position || 0)),
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
