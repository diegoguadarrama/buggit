import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/components/UserContext';
import type { TaskType, Stage } from '@/types/task';
import type { DragEndEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core';

export const stages: Stage[] = ['To Do', 'In Progress', 'Done'];

const POSITION_STEP = 1000;
const MAX_SAFE_POSITION = 1000000000; // 1 billion
const MIN_SAFE_POSITION = 0;

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

const normalizePositions = async (projectId: string, stage: Stage, tasks: TaskType[]) => {
  console.log('Normalizing positions for stage:', stage, 'tasks:', tasks.length);
  
  const sortedTasks = [...tasks].sort((a, b) => (a.position || 0) - (b.position || 0));
  const updates = sortedTasks.map((task, index) => ({
    id: task.id,
    newPosition: (index + 1) * POSITION_STEP
  }));

  // Batch update all tasks with new positions
  for (const update of updates) {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        position: update.newPosition,
        updated_at: new Date().toISOString()
      })
      .eq('id', update.id)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error normalizing position for task:', update.id, error);
    }
  }

  return updates;
};

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

      return data.map(transformSupabaseTask).sort((a, b) => (a.position || 0) - (b.position || 0));
    },
    enabled: !!projectId,
  });

  const handleDragStart = (event: { active: { id: UniqueIdentifier } }) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setPreviewStage(null);
      return;
    }

    const activeTask = tasks.find(task => task.id === active.id);
    if (!activeTask) return;

    const overId = over.id;
    
    let newStage: Stage | null = null;
    
    if (typeof overId === 'string') {
      if (stages.includes(overId as Stage)) {
        newStage = overId as Stage;
      } else {
        const overTask = tasks.find(task => task.id === overId);
        if (overTask) {
          newStage = overTask.stage;
        }
      }
    }

    if (newStage !== previewStage) {
      setPreviewStage(newStage);
    }
  };

  const calculateNewPosition = (tasks: TaskType[], overIndex: number, stage: Stage): number => {
    const columnTasks = tasks.filter(t => t.stage === stage);
    
    if (columnTasks.length === 0) return POSITION_STEP;
    
    if (overIndex === 0) {
      const firstPosition = columnTasks[0]?.position || POSITION_STEP;
      return Math.max(MIN_SAFE_POSITION, Math.floor(firstPosition - POSITION_STEP));
    }
    
    if (overIndex >= columnTasks.length) {
      const lastPosition = columnTasks[columnTasks.length - 1]?.position || 0;
      const newPosition = Math.floor(lastPosition + POSITION_STEP);
      
      // If position is getting too large, trigger normalization
      if (newPosition > MAX_SAFE_POSITION) {
        console.log('Position too large, will normalize after update');
        return POSITION_STEP * (columnTasks.length + 1);
      }
      
      return newPosition;
    }
    
    const prevPosition = Math.floor(columnTasks[overIndex - 1]?.position || 0);
    const nextPosition = Math.floor(columnTasks[overIndex]?.position || (prevPosition + 2 * POSITION_STEP));
    
    // If positions are too close, trigger normalization
    if (nextPosition - prevPosition < 2) {
      console.log('Positions too close, will normalize after update');
      return prevPosition + 1;
    }
    
    return Math.floor(prevPosition + ((nextPosition - prevPosition) / 2));
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
      let newPosition: number;
      
      // Get tasks in the target column, sorted by position
      const getColumnTasks = (stage: Stage) => 
        tasks
          .filter(t => t.stage === stage && t.project_id === projectId && t.id !== activeTask.id)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

      if (stages.includes(overId as Stage)) {
        // Dropping directly onto a column
        targetStage = overId as Stage;
        const columnTasks = getColumnTasks(targetStage);
        newPosition = calculateNewPosition(columnTasks, columnTasks.length, targetStage);
      } else {
        // Dropping onto another task
        const overTask = tasks.find(task => task.id === overId);
        if (!overTask) return;
        
        targetStage = overTask.stage;
        const columnTasks = getColumnTasks(targetStage);
        const overIndex = columnTasks.findIndex(t => t.id === overId);
        newPosition = calculateNewPosition(columnTasks, overIndex, targetStage);
      }

      // Optimistically update the UI
      queryClient.setQueryData(['tasks', projectId], (oldTasks: TaskType[] | undefined) => {
        if (!oldTasks) return [];
        return oldTasks.map(task =>
          task.id === activeTask.id
            ? { ...task, stage: targetStage, position: newPosition }
            : task
        ).sort((a, b) => (a.position || 0) - (b.position || 0));
      });

      // Update the database
      const { error } = await supabase
        .from('tasks')
        .update({
          stage: targetStage,
          position: Math.floor(newPosition),
          updated_at: new Date().toISOString()
        })
        .eq('id', activeTask.id)
        .eq('project_id', projectId);

      if (error) throw error;

      // Check if normalization is needed
      const columnTasks = tasks.filter(t => 
        t.project_id === projectId && 
        t.stage === targetStage
      );
      
      const shouldNormalize = columnTasks.some((task, index) => {
        if (index === 0) return false;
        const prevTask = columnTasks[index - 1];
        return task.position - prevTask.position < 2 || task.position > MAX_SAFE_POSITION;
      });

      if (shouldNormalize) {
        console.log('Normalizing positions after drag');
        await normalizePositions(projectId, targetStage, columnTasks);
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
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
