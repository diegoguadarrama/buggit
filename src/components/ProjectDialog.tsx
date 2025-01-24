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
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const { setCurrentProject, refetchProjects } = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === 'modify' && project) {
      setName(project.name);
      setDescription(project.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [mode, project, open]);

  const createOnboardingTasks = async (projectId: string) => {
    if (!user) return;

  const handleDelete = async () => {
    if (!project || !user) return;
    
    setIsLoading(true);
    try {
      // Delete all project tasks
      const { error: tasksError } = await supabase
        .from("tasks")
        .delete()
        .eq('project_id', project.id);

      if (tasksError) throw tasksError;

      // Delete all project notes
      const { error: notesError } = await supabase
        .from("notes")
        .delete()
        .eq('project_id', project.id);

      if (notesError) throw notesError;

      // Delete all project members
      const { error: membersError } = await supabase
        .from("profiles_projects")
        .delete()
        .eq('project_id', project.id);

      if (membersError) throw membersError;

      // Finally, delete the project itself
      const { error: projectError } = await supabase
        .from("projects")
        .delete()
        .eq('id', project.id);

      if (projectError) throw projectError;

      // Find another project to navigate to
      const { data: otherProjects } = await supabase
        .from('profiles_projects')
        .select('project_id, projects(id, name, description)')
        .eq('profile_id', user.id)
        .neq('project_id', project.id)
        .limit(1)
        .single();

      // Close both dialogs
      setShowDeleteDialog(false);
      onOpenChange(false);

      if (otherProjects?.projects) {
        // Navigate to another project
        const nextProject = {
          id: otherProjects.projects.id,
          name: otherProjects.projects.name,
          description: otherProjects.projects.description,
        };
        setCurrentProject(nextProject);
        navigate('/dashboard');
      } else {
        // No other projects, show NoProjectsFound
        setCurrentProject(null);
        navigate('/dashboard');
      }

      // Refetch projects to update the list
      await refetchProjects();
      
      toast({
        title: "Project deleted",
        description: "Project and all associated data have been deleted",
      });
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        // Check if this is the user's first project
        const { data: existingProjects, error: countError } = await supabase
          .from("projects")
          .select("id")
          .eq("user_id", user.id);

        if (countError) throw countError;

        const isFirstProject = !existingProjects || existingProjects.length === 0;

      }
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

  const handleDeleteClick = () => {
    setDeleteConfirmation("");
    setShowDeleteDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Create New Project' : 'Modify Project'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Project Name: Monthly Goals, App Redesign..."
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
              {mode === 'modify' && project?.role === 'owner' && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={isLoading}
                >
                  Delete Project
                </Button>
              )}
              <div className="flex-1" />
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This action cannot be undone. All project data including tasks, notes, and member associations will be permanently deleted.
              </p>
              <p className="font-medium">
                Please type "{project?.name}" to confirm deletion:
              </p>
              <Input
                placeholder="Type project name here..."
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="mt-2"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteConfirmation !== project?.name || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </div>
              ) : (
                'Delete Project'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
