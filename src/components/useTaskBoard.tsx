import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/components/UserContext';
import type { TaskType, Stage, Priority, NotificationType } from '@/types/task';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import type { Database } from '@/integrations/supabase/types';

// Define the SupabaseTask type based on the Database type
type SupabaseTask = Database['public']['Tables']['tasks']['Row'];

export const stages: Stage[] = ['To Do', 'In Progress', 'Done'];

const transformSupabaseTask = (task: SupabaseTask): TaskType => ({
  id: task.id,
  title: task.title,
  description: task.description,
  priority: task.priority as Priority,
  stage: task.stage as Stage,
  assignee: task.assignee || 'unassigned',
  attachments: task.attachments,
  created_at: task.created_at,
  updated_at: task.updated_at,
  due_date: task.due_date,
  archived: task.archived ?? false,
  project_id: task.project_id,
  user_id: task.user_id,
  position: Math.floor(task.position ?? 0)
});

export const useTaskBoard = (projectId: string | undefined) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewStage, setPreviewStage] = useState<Stage | null>(null);
  const [loading, setLoading] = useState(false);
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
  let newPosition = activeTask.position;

  try {
    if (stages.includes(over.id as Stage)) {
      targetStage = over.id as Stage;
      const tasksInTargetStage = tasks.filter(t => t.stage === targetStage);
      newPosition = tasksInTargetStage.length * 1000;
    } else {
      const overTask = tasks.find(task => task.id === over.id);
      if (!overTask) return;

      targetStage = overTask.stage;
      const tasksInStage = tasks.filter(t => t.stage === targetStage)
        .sort((a, b) => a.position - b.position);

      const activeIndex = tasksInStage.findIndex(t => t.id === activeTask.id);
      const overIndex = tasksInStage.findIndex(t => t.id === overTask.id);
      
      const newOrder = [...tasksInStage];
      if (activeIndex !== -1) {
        newOrder.splice(activeIndex, 1);
      }
      const newIndex = overIndex >= 0 ? overIndex : newOrder.length;
      newOrder.splice(newIndex, 0, activeTask);
      
      const updatedTasks = newOrder.map((task, index) => ({
        ...task,
        position: index * 1000,
        stage: targetStage
      }));

      // Optimistic update
      const tasksOutsideStage = tasks.filter(t => t.stage !== targetStage);
      const updatedAllTasks = [...tasksOutsideStage, ...updatedTasks]
        .sort((a, b) => a.position - b.position);

      queryClient.setQueryData(['tasks', projectId], updatedAllTasks);

      // Replace the for loop with this batch update
      const { error: batchUpdateError } = await supabase.rpc('batch_update_tasks', {
        p_tasks: updatedTasks.map(task => ({
          id: task.id,
          position: task.position,
          stage: task.stage
        }))
      });

      if (batchUpdateError) throw batchUpdateError;
    }

    await queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });

  } catch (error: any) {
    console.error('Error updating task positions:', error);
    toast({
      title: "Error updating task positions",
      description: error.message,
      variant: "destructive"
    });
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
  }
};
  
  const handleDragCancel = () => {
    setActiveId(null);
    setPreviewStage(null);
  };

  const handleTaskCreate = async (taskData: Partial<TaskType>, notificationData?: { recipient_id: string }) => {
    if (!projectId || !user) return null;
    setLoading(true);

    try {
      // Get the position for the new task
      const { data: positionData, error: positionError } = await supabase
        .from('tasks')
        .select('position')
        .eq('project_id', projectId)
        .eq('stage', taskData.stage || 'To Do')
        .order('position', { ascending: false })
        .limit(1);

      if (positionError) {
        console.error('Position query error:', positionError);
        throw positionError;
      }

      const newPosition = positionData && positionData.length > 0 
        ? positionData[0].position + 1000 
        : 1000;

      console.log('Creating task with data:', {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        stage: taskData.stage,
        assignee: taskData.assignee,
        attachments: taskData.attachments,
        due_date: taskData.due_date,
        project_id: projectId,
        user_id: user.id,
        position: newPosition,
        archived: false
      });

      const { data: insertedTask, error: insertError } = await supabase
        .rpc('create_task', {
          p_title: taskData.title || '',
          p_description: taskData.description || null,
          p_priority: taskData.priority || 'medium',
          p_stage: taskData.stage || 'To Do',
          p_assignee: taskData.assignee || null,
          p_attachments: taskData.attachments || [],
          p_due_date: taskData.due_date || null,
          p_project_id: projectId,
          p_user_id: user.id,
          p_position: newPosition,
          p_archived: false
        });

      if (insertError) {
        console.error('Insert error details:', {
          error: insertError,
          data: taskData
        });
        throw insertError;
      }

      console.log('Successfully created task:', insertedTask);

      if (insertedTask) {
        if (notificationData) {
          const notificationContent = {
            task_id: (insertedTask as any).id,
            task_title: (insertedTask as any).title,
            project_id: projectId,
            action: 'created'
          };

          const notificationParams = {
            p_recipient_id: notificationData.recipient_id,
            p_sender_id: user.id,
            p_type: 'task_assigned' as NotificationType,
            p_content: notificationContent,
            p_created_at: new Date().toISOString()
          };

          const { error: notificationError } = await supabase.rpc(
            'create_notification',
            notificationParams
          );

          if (notificationError) {
            console.error('Notification creation error:', notificationError);
          }
        }

        await queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        return transformSupabaseTask(insertedTask as SupabaseTask);
      }

      return null;
    } catch (error: any) {
      console.error('Error in handleTaskCreate:', error);
      toast({
        title: "Error creating task",
        description: error.message || 'Failed to create task',
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (task: TaskType): Promise<void> => {
    if (!projectId) return;

    try {
      const updateData = {
        title: task.title,
        description: task.description ?? null,
        priority: task.priority,
        stage: task.stage,
        assignee: task.assignee === 'unassigned' ? null : task.assignee,
        attachments: task.attachments ?? [],
        due_date: task.due_date ?? null,
        archived: task.archived ?? false,
        updated_at: new Date().toISOString(),
        position: task.position
      };

      const { error: taskUpdateError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id)
        .eq('project_id', projectId);
      
      if (taskUpdateError) {
        console.log("Task Assignee Task Update Error:", task.assignee);
        console.error('Task update error:', taskUpdateError);
        throw taskUpdateError;
      }
      
      if (task.assignee && task.assignee !== 'unassigned') {
        try {
          const notificationContent = {
            task_id: task.id,
            task_title: task.title,
            project_id: projectId,
            action: 'updated'
          };

          const notificationParams = {
            p_recipient_id: task.assignee,
            p_sender_id: user?.id ?? task.user_id,
            p_type: 'task_updated' as NotificationType,
            p_content: JSON.stringify(notificationContent),
            p_created_at: new Date().toISOString()
          };

          console.log('Notification params:', notificationParams);

          const { error: notificationError } = await supabase.rpc(
            'create_notification',
            notificationParams
          );

          if (notificationError) {
            console.error('Notification creation error:', notificationError);
          }
        } catch (notificationError) {
          console.error('Notification creation error:', notificationError);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });

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
    loading,
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
