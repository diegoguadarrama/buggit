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

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(task => task.id === active.id);
    if (!activeTask) return;

    const overId = over.id;

    // If dropping over another task
    const overTask = tasks.find(task => task.id === overId);
    if (overTask) {
      setHoveredColumn(overTask.stage);
      setHoveredIndex(tasks.findIndex(t => t.id === over.id));
    } else if (typeof overId === 'string' && stages.includes(overId as Stage)) {
      // If dropping over a column
      setHoveredColumn(overId as Stage);
      setHoveredIndex(tasks.length); // Append to the end of the column
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setHoveredColumn(null);
    setHoveredIndex(null);

    if (!over) return;

    const activeTask = tasks.find(task => task.id === active.id);
    if (!activeTask) return;

    const overId = over.id;

    // Determine the target stage and index
    let targetStage: Stage | undefined;
    let targetIndex: number | undefined;

    const overTask = tasks.find(task => task.id === overId);
    if (overTask) {
      targetStage = overTask.stage;
      targetIndex = tasks.findIndex(t => t.id === over.id);
    } else if (typeof overId === 'string' && stages.includes(overId as Stage)) {
      targetStage = overId as Stage;
      targetIndex = tasks.length; // Append to the end of the column
    }

    if (!targetStage || targetStage === activeTask.stage) {
      return; // No stage change needed
    }

    // Update the local state
    const newTasks = tasks.filter(t => t.id !== activeTask.id);
    const updatedTask = { ...activeTask, stage: targetStage };

    if (targetIndex !== undefined) {
      newTasks.splice(targetIndex, 0, updatedTask);
    } else {
      newTasks.push(updatedTask);
    }

    // Optimistically update UI
    queryClient.setQueryData(['tasks', projectId], newTasks);

    // Update the database
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

  // Render tasks with visual insertion during drag over
  const renderTasks = (columnId: Stage, tasks: TaskType[]) => {
    return tasks
      .filter(task => task.stage === columnId)
      .map((task, index) => (
        <div key={task.id}>
          {hoveredColumn === columnId && hoveredIndex === index && (
            <div style={{ height: "40px", border: "2px dashed #ccc" }} />
          )}
          <TaskComponent task={task} />
        </div>
      ));
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
    renderTasks,
    isLoading
  };
};
