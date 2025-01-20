// src/components/editor/ModeSelector.tsx
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useProject } from "@/components/ProjectContext"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Note } from "@/types/note"
import { Loader2, ChevronDown, ChevronRight, FolderIcon, FileTextIcon, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { DndContext, DragOverlay, closestCorners, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useToast } from "@/components/ui/use-toast"

interface ModeSelectorProps {
  currentNote: Note | null
  onNoteSelect: (note: Note) => void
  onNewNote: (projectId: string) => void
  selectedProjectId?: string | null
}

// Draggable Note Component
function DraggableNote({ note, currentNote, onNoteSelect }: { 
  note: Note, 
  currentNote: Note | null, 
  onNoteSelect: (note: Note) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: note.id,
    data: { type: 'note', note }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer min-w-0",
        currentNote?.id === note.id && "bg-accent",
        isDragging && "opacity-50"
      )}
      onClick={() => onNoteSelect(note)}
    >
      <FileTextIcon className="h-4 w-4 shrink-0" />
      <span className="text-sm truncate min-w-0">{note.title || "Untitled Note"}</span>
    </div>
  )
}

// Project Component
function Project({ 
  project, 
  notes, 
  isExpanded, 
  isSelected, 
  isCreating, 
  currentNote,
  onToggle, 
  onNewNote, 
  onNoteSelect 
}: {
  project: any
  notes: Note[]
  isExpanded: boolean
  isSelected: boolean
  isCreating: boolean
  currentNote: Note | null
  onToggle: () => void
  onNewNote: (e: React.MouseEvent) => void
  onNoteSelect: (note: Note) => void
}) {
  const {
    setNodeRef
  } = useSortable({
    id: project.id,
    data: { type: 'project', project }
  })

  return (
    <div ref={setNodeRef} className="space-y-1">
      <div className="flex items-center gap-1">
        <div
          className={cn(
            "flex-1 flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer min-w-0",
            isSelected && "bg-muted",
            isCreating && "bg-muted"
          )}
          onClick={onToggle}
        >
          <div className="flex items-center gap-2 shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <FolderIcon className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium truncate min-w-0">{project.name}</span>
          <span className="ml-auto text-xs text-muted-foreground shrink-0">
            {notes.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 shrink-0",
            isCreating && "bg-muted"
          )}
          onClick={onNewNote}
          title={`Create new note in ${project.name}`}
        >
          <PlusIcon className="h-4 w-4" />
          <span className="sr-only">New note in {project.name}</span>
        </Button>
      </div>
      
      {isExpanded && (
        <div className="ml-8 space-y-1">
          {notes.map(note => (
            <DraggableNote
              key={note.id}
              note={note}
              currentNote={currentNote}
              onNoteSelect={onNoteSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ModeSelector({ currentNote, onNoteSelect, onNewNote, selectedProjectId }: ModeSelectorProps) {
  const { currentProject } = useProject()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})
  const [creatingNoteInProject, setCreatingNoteInProject] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Fetch projects
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

  // Fetch notes
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

  const getProjectNotes = (projectId: string) => {
    return allNotes.filter(note => note.project_id === projectId)
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const draggedNote = allNotes.find(note => note.id === active.id)
    const targetProject = projects.find(project => project.id === over.id)

    if (draggedNote && targetProject && draggedNote.project_id !== targetProject.id) {
      // Optimistically update the UI
      queryClient.setQueryData(['notes'], (old: Note[] | undefined) => {
        if (!old) return old
        return old.map(note => 
          note.id === draggedNote.id 
            ? { ...note, project_id: targetProject.id }
            : note
        )
      })

      try {
        const { error } = await supabase
          .from('notes')
          .update({ project_id: targetProject.id })
          .eq('id', draggedNote.id)

        if (error) throw error

        toast({
          title: "Note moved",
          description: `Note moved to ${targetProject.name}`,
        })
      } catch (error) {
        // Revert optimistic update on error
        queryClient.invalidateQueries(['notes'])
        toast({
          title: "Error moving note",
          description: "Failed to move note to different project",
          variant: "destructive"
        })
      }
    }
  }

  const toggleProject = (projectId: string) => {
    if (!currentNote) {
      setSelectedProject(selectedProject === projectId ? null : projectId)
    }
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }))
  }

  const handleNewNote = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCreatingNoteInProject(projectId)
    if (!currentNote) {
      setSelectedProject(projectId)
    }
    onNewNote(projectId)
  }

  // Set initial selected project
  useEffect(() => {
    if (currentProject && !selectedProject) {
      setSelectedProject(currentProject.id)
    }
  }, [currentProject])

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

  // Reset creatingNoteInProject when a note is selected
  useEffect(() => {
    if (currentNote) {
      setCreatingNoteInProject(null)
    }
  }, [currentNote])

  if (isLoadingProjects || isLoadingNotes) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="border rounded-lg p-2 space-y-2">
        <h2 className="text-lg font-semibold px-2">Notes</h2>
        <div className="space-y-1">
          {projects.map(project => (
            <Project
              key={project.id}
              project={project}
              notes={getProjectNotes(project.id)}
              isExpanded={!!expandedProjects[project.id]}
              isSelected={selectedProject === project.id}
              isCreating={creatingNoteInProject === project.id}
              currentNote={currentNote}
              onToggle={() => toggleProject(project.id)}
              onNewNote={(e) => handleNewNote(project.id, e)}
              onNoteSelect={onNoteSelect}
            />
          ))}
        </div>
      </div>
      
      <DragOverlay>
        {activeId ? (
          <div className="bg-white p-2 rounded-lg shadow-lg border">
            {allNotes.find(note => note.id === activeId)?.title || "Untitled Note"}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
