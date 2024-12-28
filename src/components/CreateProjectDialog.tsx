import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthProvider";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

export const CreateProjectDialog = ({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      // First, create the project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([
          {
            name,
            description,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      console.log('Project created:', projectData);

      // Then, add the project owner as a member
      const { error: memberError } = await supabase
        .from('profiles_projects')
        .insert([
          {
            project_id: projectData.id,
            profile_id: user.id,
            email: user.email,
            role: 'owner'
          }
        ]);

      if (memberError) throw memberError;

      console.log('Project owner added as member');

      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
      onProjectCreated();
      onOpenChange(false);
      setName("");
      setDescription("");
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={handleClose};
        handleClose();
      }}>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
