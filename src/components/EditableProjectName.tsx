import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from './ProjectContext';

interface EditableProjectNameProps {
  project: {
    id: string;
    name: string;
  };
}

export const EditableProjectName = ({ project }: EditableProjectNameProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { refetchProjects } = useProject();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleUpdate = async () => {
    if (projectName.trim() === '') {
      toast({
        title: "Invalid project name",
        description: "Project name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (projectName === project.name) {
      setIsEditing(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ name: projectName })
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: "Project updated",
        description: "Project name has been updated successfully",
      });
      
      refetchProjects();
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setProjectName(project.name);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        onBlur={handleUpdate}
        onKeyDown={handleKeyDown}
        className="max-w-[200px] h-8 text-2xl font-bold bg-transparent"
      />
    );
  }

  return (
    <span 
      className="text-2xl font-bold cursor-pointer hover:text-gray-700"
      onClick={() => setIsEditing(true)}
    >
      {project.name}
    </span>
  );
};
