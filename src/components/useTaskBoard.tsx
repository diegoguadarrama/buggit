// src/components/useTaskBoard.tsx
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
});

export const useTaskBoard = (projectId: string | undefined) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<Stage | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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
      setHoveredColumn(null);
      setHoveredIndex(null);
      return;
    }

    const activeTask = tasks.find(task => task.id === active.id);
    if (!activeTask) return;

    const overId = over.id;
    
    // If hovering over another task
    const overTask = tasks.find(task => task.id === overId);
    if (overTask) {
      // Get tasks in the target column to calculate correct index
      const columnTasks = tasks.filter(t => t.stage === overTask.stage);
      const overTaskIndex = columnTasks.findIndex(t => t.id === overId);
      
      setHoveredColumn(overTask.stage);
      setHoveredIndex(overTaskIndex);
    } else if (typeof overId === 'string' && stages.includes(overId as Stage)) {
      // If hovering over an empty column
      const targetStage = overId as Stage;
      const columnTasks = tasks.filter(t => t.stage === targetStage);
      
      setHoveredColumn(targetStage);
      setHoveredIndex(columnTasks.length); // Position at the end of column
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setHoveredColumn(null);
    setHoveredIndex(null);

    if (!over) return;

  const activeTask = tasks.find(task => task.id === active.id);
  if (!activeTask) return;

  const overId = over.id;
  
  // Determine target stage and index
  let targetStage: Stage;
  let targetIndex: number;

  const overTask = tasks.find(task => task.id === overId);
  if (overTask) {
    targetStage = overTask.stage;
    targetIndex = tasks.findIndex(t => t.id === over.id);
  } else if (typeof overId === 'string' && stages.includes(overId as Stage)) {
    targetStage = overId as Stage;
    const columnTasks = tasks.filter(t => t.stage === overId);
    targetIndex = columnTasks.length;
  } else {
    return;
  }

  // If no stage change, just reorder if needed
  if (activeTask.stage === targetStage) {
    const activeIndex = tasks.findIndex(t => t.id === active.id);
    if (activeIndex !== targetIndex) {
      const newTasks = arrayMove(tasks, activeIndex, targetIndex);
      queryClient.setQueryData(['tasks', projectId], newTasks);
    }
    return;
  }

  // Update task stage
  const newTasks = tasks.filter(t => t.id !== activeTask.id);
  const updatedTask = { ...activeTask, stage: targetStage };
  newTasks.splice(targetIndex, 0, updatedTask);
  
  // Optimistically update UI
  queryClient.setQueryData(['tasks', projectId], newTasks);

  // Update database
  const { error } = await supabase
    .from('tasks')
    .update({ 
      stage: targetStage,
      updated_at: new Date().toISOString()
    })
    .eq('id', activeTask.id)
    .eq('project_id', projectId);

  if (error) {
    console.error('Error updating task stage:', error);
    toast({
      title: "Error updating task",
      description: error.message,
      variant: "destructive"
    });
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
  } else {
    toast({
      title: "Task updated",
      description: `Task moved to ${targetStage}`,
    });
  }
};

  const handleDragCancel = () => {
    setActiveId(null);
    setHoveredColumn(null);
    setHoveredIndex(null);
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
      archived: false,
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
    hoveredColumn,
    hoveredIndex,
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
