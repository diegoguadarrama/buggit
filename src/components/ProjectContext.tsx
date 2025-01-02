import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Project, ProjectRole } from '@/types/project';
import { useAuth } from './AuthProvider';

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project) => void;
  refetchProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const { data: projects = [], refetch: refetchProjects } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('Fetching projects for user:', user.id);
      
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          profiles_projects!inner (
            role
          )
        `)
        .eq('profiles_projects.profile_id', user.id);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        throw projectsError;
      }

      return projectsData.map(project => ({
        ...project,
        role: project.profiles_projects[0].role as ProjectRole
      }));
    },
    enabled: !!user?.id,
  });

  // Load saved project ID from localStorage
  useEffect(() => {
    const savedProjectId = localStorage.getItem('currentProjectId');
    if (savedProjectId && projects.length > 0) {
      const savedProject = projects.find(p => p.id === savedProjectId);
      if (savedProject) {
        setCurrentProject(savedProject);
      } else {
        setCurrentProject(projects[0]);
      }
    } else if (projects.length > 0 && !currentProject) {
      setCurrentProject(projects[0]);
    }
  }, [projects]);

  // Save current project ID to localStorage
  const handleSetCurrentProject = (project: Project) => {
    setCurrentProject(project);
    localStorage.setItem('currentProjectId', project.id);
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        setCurrentProject: handleSetCurrentProject,
        refetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};