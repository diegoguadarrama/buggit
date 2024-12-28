import { useState, useEffect } from 'react';
import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Priority, TaskType } from '@/types/task';

// ... existing code for stages, isPriority, and transformSupabaseTask ...

export const useTaskBoard = (projectId: string | undefined) => {
  // ... existing state and hooks ...

  const handleTaskUpdate = async (updatedTask: TaskType) => {
    console.log('Updating task:', updatedTask);
    if (!projectId) return;

    // Optimistically update the local state
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
      // Revert the optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    } else {
      console.log('Task updated successfully');
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    }
  };

  // ... existing code ...

  return {
    tasks,
    activeId,
    stages,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleTaskCreate,
    handleTaskUpdate, // Add this to the returned object
    isLoading,
  };
};
