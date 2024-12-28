import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProject } from "./ProjectContext";
import { useState } from "react";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { PricingDialog } from "./PricingDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { useToast } from "./ui/use-toast";

export const ProjectSwitcher = () => {
  const { currentProject, projects, setCurrentProject, refetchProjects } = useProject();
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleNewProject = () => {
    console.log('Handling new project creation. Current tier:', subscription?.tier);
    console.log('Current project count:', projects.length);
    
    if (subscription?.tier === 'free' && projects.length >= 3) {
      toast({
        title: "Project Limit Reached",
        description: "You've reached the limit of 3 projects on the Free plan. Upgrade to create unlimited projects!",
        variant: "destructive",
      });
      setPricingOpen(true);
      return;
    }
    
    setCreateProjectOpen(true);
  };

  if (!currentProject) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-transparent">
            <span className="text-2xl font-bold">{currentProject.name}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => setCurrentProject(project)}
              className="cursor-pointer"
            >
              {project.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleNewProject}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {createProjectOpen && (
        <CreateProjectDialog
          open={createProjectOpen}
          onOpenChange={setCreateProjectOpen}
          onProjectCreated={refetchProjects}
        />
      )}

      {pricingOpen && (
        <PricingDialog
          open={pricingOpen}
          onOpenChange={setPricingOpen}
        />
      )}
    </>
  );
};