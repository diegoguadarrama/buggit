import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useProject } from "@/components/ProjectContext"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Note } from "@/types/note"
import { Loader2, ChevronDown, ChevronRight, FolderIcon, FileTextIcon, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModeSelectorProps {
  currentNote: Note | null
  onNoteSelect: (note: Note) => void
  onNewNote: (projectId: string) => void
  selectedProjectId?: string | null
}

export function ModeSelector({ currentNote, onNoteSelect, onNewNote, selectedProjectId }: ModeSelectorProps) {
  const { currentProject } = useProject()
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})
  const [creatingNoteInProject, setCreatingNoteInProject] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Fetch all projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("name", { ascending: true })

      if (error) throw error
      return data
    },
  })

  // Fetch notes for all projects
  const { data: allNotes = [], isLoading: isLoadingNotes } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as Note[]
    },
  })

  const toggleProject = (projectId: string) => {
    if (!currentNote) {
      setSelectedProject(selectedProject === projectId ? null : projectId);
    }
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }))
  }

  // Remove auto-expand effect for current project
  useEffect(() => {
    if (selectedProjectId) {
      setSelectedProject(selectedProjectId)
    }
  }, [selectedProjectId])

  const getProjectNotes = (projectId: string) => {
    return allNotes.filter(note => note.project_id === projectId)
  }

  const handleNewNote = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCreatingNoteInProject(projectId);
    if (!currentNote) {
      setSelectedProject(projectId);
    }
    onNewNote(projectId);
  };

  // Reset creatingNoteInProject when a note is selected
  useEffect(() => {
    if (currentNote) {
      setCreatingNoteInProject(null);
    }
  }, [currentNote]);

  // Set initial selected project
  useEffect(() => {
    if (currentProject && !selectedProject) {
      setSelectedProject(currentProject.id);
    }
  }, [currentProject]);

  // Update selected project when it changes externally
  useEffect(() => {
    if (selectedProjectId) {
      setSelectedProject(selectedProjectId)
      // Also expand the project when it's selected
      setExpandedProjects(prev => ({
        ...prev,
        [selectedProjectId]: true
      }))
    }
  }, [selectedProjectId])

  if (isLoadingProjects || isLoadingNotes) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-2 space-y-2">
      <h2 className="text-lg font-semibold px-2">Notes</h2>
      <div className="space-y-1">
        {projects.map(project => (
          <div key={project.id} className="space-y-1">
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  "flex-1 flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer min-w-0",
                  selectedProject === project.id && "bg-muted",
                  creatingNoteInProject === project.id && "bg-muted"
                )}
                onClick={() => toggleProject(project.id)}
              >
                <div className="flex items-center gap-2 shrink-0">
                  {expandedProjects[project.id] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <FolderIcon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium truncate min-w-0">{project.name}</span>
                <span className="ml-auto text-xs text-muted-foreground shrink-0">
                  {getProjectNotes(project.id).length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 shrink-0",
                  creatingNoteInProject === project.id && "bg-muted"
                )}
                onClick={(e) => handleNewNote(project.id, e)}
                title={`Create new note in ${project.name}`}
              >
                <PlusIcon className="h-4 w-4" />
                <span className="sr-only">New note in {project.name}</span>
              </Button>
            </div>
            
            {expandedProjects[project.id] && (
              <div className="ml-8 space-y-1">
                {getProjectNotes(project.id).map(note => (
                  <div
                    key={note.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer min-w-0",
                      currentNote?.id === note.id && "bg-accent"
                    )}
                    onClick={() => onNoteSelect(note)}
                  >
                    <FileTextIcon className="h-4 w-4 shrink-0" />
                    <span className="text-sm truncate min-w-0">{note.title || "Untitled Note"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}