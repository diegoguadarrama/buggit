import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/components/UserContext';
import type { TaskType, Stage } from '@/types/task';
import type { DragEndEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export const stages: Stage[] = ['To Do', 'In Progress', 'Done'];

// Helper function to transform Supabase task data
const transformSupabaseTask = (task: any): TaskType => ({
  id: task.id,
  title: task.title,
  description: task.description,
  priority: task.priority,
  stage: task.stage as Stage,
  assignee: task.assignee,
  attachments: task.attachments,
  created_at: task.created_at,
  updated_at: task.updated_at,
  due_date: task.due_date,
  archived: task.archived || false,
  project_id: task.project_id,
  user_id: task.user_id, // Add the user_id field
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
      
      console.log('Fetching tasks for project:', projectId);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true })
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

  const handleDragStart = (event: { active: { id: UniqueIdentifier } }) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = async (event: DragOverEvent) => {
  const { active, over } = event;
  if (!over) {
    setPreviewStage(null);
    return;
  }

  const activeTask = tasks.find(task => task.id === active.id);
  if (!activeTask) return;

  const overId = over.id;
  
  // Calculate new stage without triggering state updates unnecessarily
  let newStage: Stage | null = null;
  
  if (typeof overId === 'string') {
    if (stages.includes(overId as Stage)) {
      // Dragging over a column
      newStage = overId as Stage;
    } else {
      // Dragging over a task
      const overTask = tasks.find(task => task.id === overId);
      if (overTask) {
        newStage = overTask.stage;
      }
    }
  }

  // Only update preview stage if it's different
  if (newStage !== previewStage) {
    setPreviewStage(newStage);
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
    // If dropping over another task
    const overTask = tasks.find(task => task.id === overId);
    let newStage: Stage;
    let newPosition: number;
    let updates: any[] = [];

    if (overTask) {
      const targetColumnTasks = tasks
        .filter(t => t.stage === overTask.stage)
        .sort((a, b) => (a.position || 0) - (b.position || 0));
      
      const overTaskIndex = targetColumnTasks.findIndex(t => t.id === overId);
      newStage = overTask.stage;

      // Calculate new position based on surrounding tasks
      if (overTaskIndex === 0) {
        // Moving to first position
        const firstTaskPosition = targetColumnTasks[0]?.position || 0;
        const secondTaskPosition = targetColumnTasks[1]?.position || firstTaskPosition + 2000;
        newPosition = firstTaskPosition - 1000;
        
        // Ensure we don't go below 0
        if (newPosition < 0) {
          // Rebalance all positions in the column
          newPosition = 1000;
          updates = targetColumnTasks.map((task, index) => ({
            id: task.id,
            position: (index + 2) * 1000,
          }));
        }
      } else {
        // Moving between tasks
        const prevTaskPosition = targetColumnTasks[overTaskIndex - 1]?.position || 0;
        const nextTaskPosition = targetColumnTasks[overTaskIndex]?.position || prevTaskPosition + 2000;
        newPosition = prevTaskPosition + (nextTaskPosition - prevTaskPosition) / 2;
      }

    } else if (typeof overId === 'string' && stages.includes(overId as Stage)) {
      // Dropping into an empty column
      newStage = overId as Stage;
      const columnTasks = tasks
        .filter(t => t.stage === newStage)
        .sort((a, b) => (a.position || 0) - (b.position || 0));
      
      newPosition = columnTasks.length > 0 
        ? (columnTasks[columnTasks.length - 1].position || 0) + 1000
        : 1000;
    } else {
      return;
    }

    // Prepare the task update
    const taskUpdate = {
      stage: newStage,
      position: newPosition,
      project_id: projectId,
      user_id: activeTask.user_id,
      title: activeTask.title,
      priority: activeTask.priority,
      assignee: activeTask.assignee
    };

    // Optimistically update the UI
    queryClient.setQueryData(['tasks', projectId], (oldTasks: TaskType[] | undefined) => {
      if (!oldTasks) return [];
      const updatedTasks = oldTasks.map(task => 
        task.id === activeTask.id 
          ? { ...task, ...taskUpdate }
          : task
      );
      return updatedTasks.sort((a, b) => (a.position || 0) - (b.position || 0));
    });

    // Update the task in the database
    const { error: taskError } = await supabase
      .from('tasks')
      .update(taskUpdate)
      .eq('id', activeTask.id)
      .eq('project_id', projectId);

    if (taskError) throw taskError;

    // If we need to rebalance positions, do it
    if (updates.length > 0) {
      for (const update of updates) {
        const { error } = await supabase
          .from('tasks')
          .update({ position: update.position })
          .eq('id', update.id)
          .eq('project_id', projectId);
        
        if (error) throw error;
      }
    }

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

  const handleDragCancel = () => {
    setActiveId(null);
    setPreviewStage(null);
  };

  const handleTaskCreate = async (newTask: Partial<TaskType>) => {
    if (!user || !projectId) return;

    const stage = (newTask.stage || 'To Do') as Stage;
    if (!stages.includes(stage)) {
      console.error('Invalid stage:', stage);
      toast({
        title: "Error creating task",
        description: "Invalid stage value",
        variant: "destructive"
      });
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
      archived: false, // Default to not archived
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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

    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    return transformSupabaseTask(data);
  };

  const handleTaskUpdate = async (updatedTask: TaskType) => {
    if (!projectId) return;

    if (!stages.includes(updatedTask.stage)) {
      console.error('Invalid stage:', updatedTask.stage);
      toast({
        title: "Error updating task",
        description: "Invalid stage value",
        variant: "destructive"
      });
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
        updated_at: new Date().toISOString(),
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
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    } else {
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    }
  };

  const handleTaskArchive = async (taskId: string) => {
    if (!projectId) return;

    // Optimistically update UI
    queryClient.setQueryData(['tasks', projectId], (oldTasks: TaskType[] | undefined) => {
      if (!oldTasks) return [];
      return oldTasks.filter(task => task.id !== taskId);
    });

    const { error } = await supabase
      .from('tasks')
      .update({ archived: true, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error archiving task:', error);
      toast({
        title: "Error archiving task",
        description: error.message,
        variant: "destructive"
      });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    } else {
      toast({
        title: "Task archived",
        description: "The task has been archived successfully.",
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
