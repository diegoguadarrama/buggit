import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { useProject } from "./ProjectContext";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: () => void;
}

export const CreateProjectDialog = ({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { setCurrentProject, refetchProjects } = useProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Create the project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          name,
          description,
          user_id: user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      console.log("Project created:", project);

      // Add the project owner as a member
      const { error: memberError } = await supabase
        .from("profiles_projects")
        .insert({
          profile_id: user.id,
          project_id: project.id,
          role: "owner",
          email: user.email,
        });

      if (memberError) throw memberError;

      console.log("Project owner added as member");

      // Set the new project as current
      setCurrentProject({
        id: project.id,
        name: project.name,
        description: project.description,
        role: "owner"
      });

      // Refetch projects to update the list
      if (onProjectCreated) {
        await onProjectCreated();
      }
      
      // Close the dialog
      onOpenChange(false);
      
      // Reset form
      setName("");
      setDescription("");

      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error: any) {
      console.error("Error creating project:", error);
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
          <DialogTitle>Create New Project</DialogTitle>
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
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};