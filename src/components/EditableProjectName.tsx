import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from './ProjectContext';

interface EditableProjectNameProps {
  project: {
    id: string;
    name: string;
    role?: 'owner' | 'member';
  };
}

export const EditableProjectName = ({ project }: EditableProjectNameProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [hasChanged, setHasChanged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { refetchProjects } = useProject();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setProjectName(project.name);
  }, [project.name]);

  const handleClick = () => {
    if (project.role !== 'owner') {
      toast({
        title: "Permission denied",
        description: "Only project owners can edit the project name",
        variant: "destructive",
      });
      return;
    }
    setIsEditing(true);
    setHasChanged(false); // Reset change tracker when starting edit
  };

  const handleUpdate = async (shouldUpdate: boolean = true) => {
    // Don't update if we haven't made any changes
    if (!hasChanged) {
      setIsEditing(false);
      setProjectName(project.name);
      return;
    }

    if (!shouldUpdate) {
      setIsEditing(false);
      setProjectName(project.name);
      setHasChanged(false);
      return;
    }

    if (project.role !== 'owner') {
      toast({
        title: "Permission denied",
        description: "Only project owners can edit the project name",
        variant: "destructive",
      });
      setIsEditing(false);
      setProjectName(project.name);
      return;
    }

    const trimmedName = projectName.trim();
    if (trimmedName === '') {
      toast({
        title: "Invalid project name",
        description: "Project name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (trimmedName === project.name) {
      setIsEditing(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ name: trimmedName })
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: "Project updated",
        description: "Project name has been updated successfully",
      });
      
      refetchProjects();
      setIsEditing(false);
      setHasChanged(false);
    } catch (error: any) {
      toast({
        title: "Error updating project",
        description: error.message,
        variant: "destructive",
      });
      setProjectName(project.name);
      setIsEditing(false);
      setHasChanged(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdate(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleUpdate(false);
    } else if (e.key === ' ') {
      e.stopPropagation();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
    setHasChanged(true); // Mark that we've made changes
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={projectName}
        onChange={handleChange}
        onBlur={() => handleUpdate(true)}
        onKeyDown={handleKeyDown}
        className="max-w-[200px] h-8 text-2xl font-bold bg-transparent"
      />
    );
  }

  return (
    <span 
      className={`text-2xl font-bold ${project.role === 'owner' ? 'cursor-pointer hover:text-gray-700' : ''}`}
      onClick={handleClick}
      title={project.role === 'owner' ? 'Click to edit project name' : 'Only project owners can edit the name'}
    >
      {project.name}
    </span>
  );
};
