import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/components/ui/use-toast";

interface Project {
  id: string;
  name: string;
  description: string | null;
  role?: 'owner' | 'member';
}

interface ProjectContextType {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  projects: Project[];
  loading: boolean;
  refetchProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching projects for user:', user.id);
      
      // First fetch all projects where user is owner
      const ownerProjectsQuery = await supabase
        .from('projects')
        .select('*, profiles_projects!inner(role)')
        .eq('user_id', user.id);

      if (ownerProjectsQuery.error) throw ownerProjectsQuery.error;

      // Then fetch projects where user is a member
      const memberProjectsQuery = await supabase
        .from('projects')
        .select('*, profiles_projects!inner(role)')
        .eq('profiles_projects.profile_id', user.id)
        .neq('user_id', user.id);

      if (memberProjectsQuery.error) throw memberProjectsQuery.error;

      // Combine and transform the results
      const allProjects = [
        ...(ownerProjectsQuery.data || []).map(project => ({
          ...project,
          role: project.profiles_projects[0].role
        })),
        ...(memberProjectsQuery.data || []).map(project => ({
          ...project,
          role: project.profiles_projects[0].role
        }))
      ];

      console.log('Fetched projects:', allProjects);
      setProjects(allProjects);
      
      if (allProjects.length > 0 && !currentProject) {
        setCurrentProject(allProjects[0]);
      }
    } catch (error: any) {
      console.error('Project fetch error:', error);
      toast({
        title: "Error fetching projects",
        description: error.message,
        variant: "destructive"
      });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return (
    <ProjectContext.Provider value={{
      currentProject,
      setCurrentProject,
      projects,
      loading,
      refetchProjects: fetchProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};