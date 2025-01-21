import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useProject } from "@/components/ProjectContext"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Note } from "@/types/note"
import { Loader2, ChevronDown, ChevronRight, FolderIcon, FileTextIcon, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  useSensor, 
  useSensors, 
  PointerSensor,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
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
  note: Note
  currentNote: Note | null
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
    data: {
      type: 'note',
      note,
      accepts: ['note']
    }
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

// Drop Zone Component
function DropZone({ 
  projectId, 
  noteId,
  isOver,
}: { 
  projectId: string
  noteId?: string
  isOver: boolean
}) {
  return (
    <div 
      data-project-id={projectId}
      data-note-id={noteId}
      className={cn(
        "h-2 -my-1 rounded-full transition-all duration-200",
        isOver 
          ? "bg-primary/50 scale-y-100" 
          : "bg-transparent scale-y-50 hover:scale-y-100 hover:bg-primary/20"
      )}
    />
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
  onNoteSelect,
  activeId,
  overDropZone
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
  activeId: string | null
  overDropZone: { projectId: string, noteId?: string } | null
}) {
  const {
    setNodeRef
  } = useSortable({
    id: project.id,
    data: {
      type: 'project',
      project,
      accepts: ['note']
    }
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
          <DropZone 
            projectId={project.id}
            isOver={overDropZone?.projectId === project.id && !overDropZone?.noteId}
          />
          <SortableContext items={notes.map(note => note.id)} strategy={verticalListSortingStrategy}>
            {notes.map((note, index) => (
              <div key={note.id} className="space-y-1">
                <DraggableNote
                  note={note}
                  currentNote={currentNote}
                  onNoteSelect={onNoteSelect}
                />
                <DropZone 
                  projectId={project.id}
                  noteId={note.id}
                  isOver={
                    overDropZone?.projectId === project.id && 
                    overDropZone?.noteId === note.id
                  }
                />
              </div>
            ))}
          </SortableContext>
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
  const [overDropZone, setOverDropZone] = useState<{ projectId: string, noteId?: string } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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

  const { data: allNotes = [], isLoading: isLoadingNotes } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("position", { ascending: true })
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as Note[]
    },
  })

  const getProjectNotes = (projectId: string) => {
    return allNotes.filter(note => note.project_id === projectId)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (!over) {
      setOverDropZone(null)
      return
    }

    const projectId = over.data.current?.projectId || over.id
    const noteId = over.data.current?.noteId

    setOverDropZone({ projectId, noteId })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverDropZone(null)

    if (!over || !active) return

    const draggedNote = allNotes.find(note => note.id === active.id)
    if (!draggedNote) return

    const targetProjectId = over.data.current?.projectId || over.id
    const targetNoteId = over.data.current?.noteId

    if (draggedNote.project_id === targetProjectId && !targetNoteId) return

    try {
      const projectNotes = getProjectNotes(targetProjectId).sort((a, b) => 
        (a.position || 0) - (b.position || 0)
      )
      
      let newPosition: number

      if (targetNoteId) {
        const targetNote = projectNotes.find(note => note.id === targetNoteId)
        if (targetNote) {
          const targetIndex = projectNotes.indexOf(targetNote)
          const prevNote = targetIndex > 0 ? projectNotes[targetIndex - 1] : null
          
          if (prevNote) {
            newPosition = prevNote.position + ((targetNote.position - prevNote.position) / 2)
          } else {
            newPosition = targetNote.position - 1000
          }
        } else {
          newPosition = (projectNotes[projectNotes.length - 1]?.position || 0) + 1000
        }
      } else {
        newPosition = (projectNotes[0]?.position || 0) - 1000
      }

      // Optimistic update
      queryClient.setQueryData(['notes'], (old: Note[] | undefined) => {
        if (!old) return old
        return old.map(note => 
          note.id === draggedNote.id 
            ? { ...note, project_id: targetProjectId, position: newPosition }
            : note
        )
      })

      const { error } = await supabase
        .from('notes')
        .update({ 
          project_id: targetProjectId,
          position: newPosition,
          updated_at: new Date().toISOString()
        })
        .eq('id', draggedNote.id)

      if (error) throw error

      toast({
        title: "Note moved",
        description: "Note position updated successfully",
      })

      // Refresh notes to ensure correct order
      queryClient.invalidateQueries(['notes'])
    } catch (error) {
      console.error('Error moving note:', error)
      // Revert optimistic update
      queryClient.invalidateQueries(['notes'])
      toast({
        title: "Error moving note",
        description: "Failed to update note position. Please try again.",
        variant: "destructive"
      })
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

  useEffect(() => {
    if (currentProject && !selectedProject) {
      setSelectedProject(currentProject.id)
    }
  }, [currentProject])

  useEffect(() => {
    if (selectedProjectId) {
      setSelectedProject(selectedProjectId)
      setExpandedProjects(prev => ({
        ...prev,
        [selectedProjectId]: true
      }))
    }
  }, [selectedProjectId])

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
      onDragOver={handleDragOver}
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
              activeId={activeId}
              overDropZone={overDropZone}
            />
          ))}
        </div>
      </div>
      
      <DragOverlay>
        {activeId ? (
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border">
            {allNotes.find(note => note.id === activeId)?.title || "Untitled Note"}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
