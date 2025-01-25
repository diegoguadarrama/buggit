import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/components/UserContext';
import type { TaskType, Stage } from '@/types/task';
import type { DragEndEvent, DragOverEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export const stages: Stage[] = ['To Do', 'In Progress', 'Done'];

const POSITION_STEP = 1000; // Base step for position calculations

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
  user_id: task.user_id,
  position: task.position || 0,
});

// Helper function to calculate new position
const calculateNewPosition = (prevPosition: number | undefined, nextPosition: number | undefined): number => {
  if (!prevPosition && !nextPosition) return POSITION_STEP;
  if (!prevPosition) return Math.floor(nextPosition! / 2);
  if (!nextPosition) return prevPosition + POSITION_STEP;
  return Math.floor((prevPosition + nextPosition) / 2);
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

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setPreviewStage(null);
      return;
    }

    const activeTask = tasks.find(task => task.id === active.id);
    if (!activeTask) return;

    const overId = over.id;
    const overTask = tasks.find(task => task.id === overId);
    const newStage = overTask ? overTask.stage : (overId as Stage);
    
    // Only update preview stage if it's different
    if (newStage && newStage !== previewStage) {
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
    const overTask = tasks.find(task => task.id === overId);
    let newStage: Stage;
    let newPosition: number;

    // Get tasks in the target column
    const getColumnTasks = (stage: Stage) => 
      tasks.filter(t => t.stage === stage)
           .sort((a, b) => (a.position || 0) - (b.position || 0));

    if (overTask) {
      newStage = overTask.stage;
      const columnTasks = getColumnTasks(newStage);
      const overIndex = columnTasks.findIndex(t => t.id === over.id);
      
      if (activeTask.stage === overTask.stage) {
        // Reordering within the same column
        const activeIndex = columnTasks.findIndex(t => t.id === active.id);
        const reorderedTasks = arrayMove(columnTasks, activeIndex, overIndex);
        
        // Recalculate positions for the entire column
        const updates = reorderedTasks.map((task, index) => ({
          id: task.id,
          position: (index + 1) * POSITION_STEP,
          project_id: projectId,
          stage: task.stage,
          user_id: task.user_id,
          title: task.title,
          priority: task.priority,
          assignee: task.assignee
        }));

        // Optimistically update the UI
        queryClient.setQueryData(['tasks', projectId], 
          tasks.map(task => {
            const update = updates.find(u => u.id === task.id);
            return update ? { ...task, position: update.position } : task;
          })
        );

        // Update positions in the database
        for (const update of updates) {
          const { error } = await supabase
            .from('tasks')
            .update(update)
            .eq('id', update.id)
            .eq('project_id', projectId);

          if (error) {
            console.error('Error updating task positions:', error);
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            return;
          }
        }
        return;
      }
      
      // Moving to a different column
      const prevTask = overIndex > 0 ? columnTasks[overIndex - 1] : null;
      const nextTask = columnTasks[overIndex];
      newPosition = calculateNewPosition(
        prevTask?.position,
        nextTask?.position
      );
      
    } else if (stages.includes(overId as Stage)) {
      newStage = overId as Stage;
      const columnTasks = getColumnTasks(newStage);
      
      if (columnTasks.length === 0) {
        newPosition = POSITION_STEP;
      } else {
        // Add to the end of the column
        const lastTask = columnTasks[columnTasks.length - 1];
        newPosition = (lastTask.position || 0) + POSITION_STEP;
      }
    } else {
      return;
    }

    // Optimistically update the UI
    const updatedTask = {
      ...activeTask,
      stage: newStage,
      position: newPosition
    };

    queryClient.setQueryData(['tasks', projectId], 
      tasks.map(task => task.id === activeTask.id ? updatedTask : task)
    );

    // Update in database
    const { error } = await supabase
      .from('tasks')
      .update({ 
        stage: newStage,
        position: newPosition,
        project_id: projectId,
        user_id: activeTask.user_id,
        title: activeTask.title,
        priority: activeTask.priority,
        assignee: activeTask.assignee
      })
      .eq('id', activeTask.id)
      .eq('project_id', projectId);

    if (error) {
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
