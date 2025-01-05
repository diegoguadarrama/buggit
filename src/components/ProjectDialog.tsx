import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { useProject } from "./ProjectContext";
import type { Project } from "@/types/project";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: () => void;
  mode: 'create' | 'modify';
  project?: Project;
}

export const ProjectDialog = ({
  open,
  onOpenChange,
  onProjectCreated,
  mode = 'create',
  project
}: ProjectDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { setCurrentProject, refetchProjects } = useProject();

  useEffect(() => {
    if (mode === 'modify' && project) {
      setName(project.name);
      setDescription(project.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [mode, project, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedName = name.trim();
    if (trimmedName === '') {
      toast({
        title: "Invalid project name",
        description: "Project name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'create') {
        // Create new project
        const { data: newProject, error: projectError } = await supabase
          .from("projects")
          .insert({
            name: trimmedName,
            description: description.trim(),
            user_id: user.id,
          })
          .select()
          .single();

        if (projectError) throw projectError;

        // Add the project owner as a member
        const { error: memberError } = await supabase
          .from("profiles_projects")
          .insert({
            profile_id: user.id,
            project_id: newProject.id,
            role: "owner",
            email: user.email,
          });

        if (memberError) throw memberError;

        // Set the new project as current
        setCurrentProject({
          id: newProject.id,
          name: newProject.name,
          description: newProject.description,
          role: "owner"
        });

      } else if (mode === 'modify' && project) {
        // Update existing project
        const { error: updateError } = await supabase
          .from("projects")
          .update({
            name: trimmedName,
            description: description.trim(),
          })
          .eq('id', project.id);

        if (updateError) throw updateError;
      }

      // Refetch projects to update the list
      await refetchProjects();
      if (onProjectCreated) {
        await onProjectCreated();
      }
      
      // Close the dialog
      onOpenChange(false);
      
      // Remove success toast - only show errors
    } catch (error: any) {
      console.error(`Error ${mode}ing project:`, error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Project' : 'Modify Project'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Textarea
              placeholder="Project Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </div>
              ) : (
                mode === 'create' ? 'Create Project' : 'Update Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};