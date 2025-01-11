import { useState, useEffect } from "react"
import { EditorToolbar } from "@/components/editor/EditorToolbar"
import { ModeSelector } from "@/components/editor/ModeSelector"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FolderInput, Check, FolderIcon, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tag } from 'lucide-react'
import { useAuth } from "@/components/AuthProvider"
import { useProject } from "@/components/ProjectContext"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import CharacterCount from '@tiptap/extension-character-count'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'
import { EditorBubbleMenu } from "@/components/editor/BubbleMenu"
import { LinkDialog } from "@/components/editor/LinkDialog"
import { Note } from "@/types/note"
import "@/components/editor/Editor.css"
import { Sidebar } from "@/components/Sidebar"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/SidebarContext"

// Custom extension for handling empty list items
const ListKeyboardShortcuts = Extension.create({
  name: 'listKeyboardShortcuts',
  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { empty, $anchor } = this.editor.state.selection
        const isAtStart = $anchor.pos === $anchor.start()
        
        // Check if we're in a list item and it's empty
        if (empty && (this.editor.isActive('bulletList') || this.editor.isActive('orderedList'))) {
          const node = $anchor.node()
          if (node.textContent === '' && isAtStart) {
            // If in a list and the item is empty, lift the list item
            return this.editor.commands.liftListItem('listItem')
          }
        }

        // Handle backspace at the start of a paragraph that follows a list
        if (empty && isAtStart && !this.editor.isActive('bulletList') && !this.editor.isActive('orderedList')) {
          const pos = $anchor.pos
          const resolvedPos = this.editor.state.doc.resolve(pos)
          const before = resolvedPos.nodeBefore
          
          // If there's a list before the current paragraph
          if (before && (before.type.name === 'bulletList' || before.type.name === 'orderedList')) {
            const listType = before.type.name === 'bulletList' ? 'bulletList' : 'orderedList'
            const command = listType === 'bulletList' ? 'toggleBulletList' : 'toggleOrderedList'
            return this.editor.commands[command]()
          }
        }
        
        return false
      },
    }
  },
})

export default function Notes() {
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [title, setTitle] = useState("")
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [selectedProjectForNote, setSelectedProjectForNote] = useState<{ id: string, name: string } | null>(null)
  const { user } = useAuth()
  const { currentProject } = useProject()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [isMovingDesktop, setIsMovingDesktop] = useState(false)
  const [isMovingMobile, setIsMovingMobile] = useState(false)
  const { expanded } = useSidebar()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'cursor-pointer'
        },
        validate: href => /^https?:\/\//.test(href),
      }),
      BulletList.configure({
        keepMarks: true,
        keepAttributes: false,
      }),
      OrderedList.configure({
        keepMarks: true,
        keepAttributes: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg',
          width: '250',
        },
      }),
      Highlight.configure({
        multicolor: false,
      }),
      CharacterCount.configure({
        limit: null,
      }),
      BubbleMenu.configure({
        shouldShow: ({ editor, state }) => {
          const selection = state.selection
          const isTextSelection = selection instanceof TextSelection
          
          // Only show for text selections and when no image is selected
          return isTextSelection && !editor.isActive('image')
        },
        tippyOptions: {
          duration: 100,
          appendTo: () => document.body,
          placement: 'top',
          onClickOutside: () => {
            editor?.commands.focus()
          },
        }
      }),
      ListKeyboardShortcuts,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      console.log('Content updated:', editor.getHTML())
    },
    autofocus: true,
    editorProps: {
      handleClick: () => {
        editor?.commands.focus()
        return false
      },
    },
  })

  // Load note content when a note is selected
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title)
      editor?.commands.setContent(currentNote.content)
    }
  }, [currentNote, editor])

  const handleNoteSelect = (note: Note) => {
    setCurrentNote(note)
    setSelectedProjectForNote(null)
  }

  const handleNewNote = (projectId: string) => {
    const getProjectInfo = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", projectId)
        .single()

      if (error) {
        console.error("Error fetching project:", error)
        return
      }

      setSelectedProjectForNote(data)
      // Only clear current note after setting the selected project
      setCurrentNote(null)
      setTitle("")
      editor?.commands.setContent("")
    }

    getProjectInfo()
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return
    
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${crypto.randomUUID()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('notes-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('notes-images')
        .getPublicUrl(filePath)

      if (editor) {
        editor.chain()
          .focus()
          .insertContent({
            type: 'image',
            attrs: { src: publicUrl }
          })
          .focus()
          .run()
      }

      toast({
        title: "Image uploaded successfully",
        description: file.name,
      })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      editor?.commands.focus()
    }
  }

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", currentProject?.id],
    queryFn: async () => {
      console.log("Fetching notes for project:", currentProject?.id)
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("project_id", currentProject?.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching notes:", error)
        throw error
      }

      return data
    },
    enabled: !!currentProject?.id,
  })

  const createNote = useMutation({
    mutationFn: async () => {
      if (!user || !editor) return

      const noteData = {
        title: title || "Untitled Note",
        content: editor.getHTML(),
        user_id: user.id,
        // For updates, only use the note's original project_id
        // For new notes, use selected or current project
        project_id: currentNote 
          ? currentNote.project_id 
          : (selectedProjectForNote?.id || currentProject?.id),
      }

      // For new notes, use insert. For updates, use upsert
      if (currentNote?.id) {
        const { data, error } = await supabase
          .from("notes")
          .update({
            ...noteData,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentNote.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        if (!currentProject && !selectedProjectForNote) return // Prevent creating notes without a project
        
        const { data, error } = await supabase
          .from("notes")
          .insert([{
            ...noteData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (error) throw error
        return data
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      setCurrentNote(data)
      setSelectedProjectForNote(null) // Clear selected project after saving
      toast({
        title: "Success",
        description: currentNote ? "Note updated successfully" : "Note created successfully",
      })
    },
    onError: (error) => {
      console.error("Error saving note:", error)
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      })
    },
  })

  const handleFormatClick = (format: string) => {
    if (!editor) return

    console.log('Format clicked:', format)

    switch (format) {
      case 'image':
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            await handleImageUpload(file)
          }
        }
        input.click()
        break
      case 'link':
        setShowLinkDialog(true)
        break
      case 'paragraph':
        editor.chain().focus().setParagraph().run()
        break
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'highlight':
        editor.chain().focus().toggleHighlight().run()
        break
      case 'h1':
        editor.chain().focus().toggleHeading({ level: 1 }).run()
        break
      case 'h2':
        editor.chain().focus().toggleHeading({ level: 2 }).run()
        break
      case 'h3':
        editor.chain().focus().toggleHeading({ level: 3 }).run()
        break
      case 'bullet-list':
        console.log('Toggling bullet list')
        editor.chain().focus().toggleBulletList().run()
        break
      case 'ordered-list':
        console.log('Toggling ordered list')
        editor.chain().focus().toggleOrderedList().run()
        break
      case 'align-left':
        break
      case 'undo':
        editor.chain().focus().undo().run()
        break
      case 'redo':
        editor.chain().focus().redo().run()
        break
    }
    
    console.log('Format applied:', format)
  }

  // Fetch all projects for the dropdown
  const { data: allProjects = [] } = useQuery({
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

  const moveNote = useMutation({
    mutationFn: async (targetProjectId: string) => {
      if (!user) return

      // If it's a new note, create it in the target project
      if (!currentNote) {
        const project = allProjects.find(p => p.id === targetProjectId)
        if (project) {
          setSelectedProjectForNote({ id: project.id, name: project.name })
          // Automatically save the note in the new project
          createNote.mutate()
        }
        return
      }

      // For existing notes, update in the database
      const { data, error } = await supabase
        .from("notes")
        .update({
          project_id: targetProjectId,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentNote.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      // Update the current note with the new project_id
      if (data) {
        setCurrentNote(data)
      }
      toast({
        title: "Success",
        description: currentNote 
          ? "Note moved successfully" 
          : "Note will be created in the selected project",
      })
      setIsMovingDesktop(false)
    },
    onError: (error) => {
      console.error("Error moving note:", error)
      toast({
        title: "Error",
        description: "Failed to move note",
        variant: "destructive",
      })
    },
  })

  const deleteNote = useMutation({
    mutationFn: async () => {
      if (!currentNote?.id) return

      const { error } = await supabase
        .from("notes")
        .delete()
        .eq('id', currentNote.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      setCurrentNote(null)
      setTitle("")
      editor?.commands.setContent("")
      toast({
        title: "Success",
        description: "Note deleted successfully",
      })
    },
    onError: (error) => {
      console.error("Error deleting note:", error)
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      })
    },
  })

  const handleDelete = () => {
    // Store the current project context before deletion
    const projectId = currentNote?.project_id || selectedProjectForNote?.id || currentProject?.id
    const project = allProjects.find(p => p.id === projectId)
    
    if (!currentNote) {
      // If it's a new note, just clear the editor
      setCurrentNote(null)
      setTitle("")
      editor?.commands.setContent("")
      // Maintain the project context
      if (project) {
        setSelectedProjectForNote({ id: project.id, name: project.name })
      }
      return
    }
    
    // Set the project context before triggering the delete mutation
    if (project) {
      setSelectedProjectForNote({ id: project.id, name: project.name })
    }
    deleteNote.mutate()
  }

  // Get the current project ID (either from the note or selected project for new notes)
  const getCurrentProjectId = () => {
    if (currentNote) {
      return currentNote.project_id
    }
    return selectedProjectForNote?.id || currentProject?.id
  }

  return (
    <>
      <Sidebar />
      <div className={cn(
        "min-h-screen bg-background",
        expanded ? "ml-52" : "ml-14"
      )}>
        <div className="container mx-auto p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
            <div className="w-full sm:flex-1 flex items-center gap-2 bg-background rounded-md border">
              <Input
                type="text"
                placeholder="Note Title"
                className="text-xl font-semibold border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <DropdownMenu open={isMovingDesktop} onOpenChange={setIsMovingDesktop}>
                <DropdownMenuTrigger asChild>
                  <div className="hidden sm:flex items-center gap-1 pr-3 hover:text-foreground cursor-pointer">
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    <FolderIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {currentNote 
                        ? allProjects.find(p => p.id === currentNote.project_id)?.name 
                        : selectedProjectForNote?.name || currentProject?.name || 'No Project Selected'}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {allProjects.map(project => {
                    const isCurrentProject = project.id === getCurrentProjectId()
                    return (
                      <DropdownMenuItem
                        key={project.id}
                        className={`flex items-center justify-between ${isCurrentProject ? 'bg-muted' : ''}`}
                        onClick={() => moveNote.mutate(project.id)}
                      >
                        {project.name}
                        {isCurrentProject && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex gap-2 w-full sm:w-auto items-center justify-between sm:justify-end">
              <div className="flex sm:hidden items-center gap-1 text-muted-foreground">
                <DropdownMenu open={isMovingMobile} onOpenChange={setIsMovingMobile}>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                      <ChevronDown className="h-3 w-3" />
                      <FolderIcon className="h-4 w-4" />
                      <span className="text-sm whitespace-nowrap">
                        {currentNote 
                          ? allProjects.find(p => p.id === currentNote.project_id)?.name 
                          : selectedProjectForNote?.name || currentProject?.name || 'No Project Selected'}
                      </span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {allProjects.map(project => {
                      const isCurrentProject = project.id === getCurrentProjectId()
                      return (
                        <DropdownMenuItem
                          key={project.id}
                          className={`flex items-center justify-between ${isCurrentProject ? 'bg-muted' : ''}`}
                          onClick={() => moveNote.mutate(project.id)}
                        >
                          {project.name}
                          {isCurrentProject && <Check className="h-4 w-4" />}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button onClick={() => createNote.mutate()}>
                {currentNote ? "Update Note" : "Save Note"}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
            <div className="hidden lg:block">
              <ModeSelector
                currentNote={currentNote}
                onNoteSelect={handleNoteSelect}
                onNewNote={handleNewNote}
                selectedProjectId={currentNote?.project_id || selectedProjectForNote?.id || currentProject?.id}
              />
            </div>
            <div className="space-y-4">
              <EditorToolbar 
                onFormatClick={handleFormatClick} 
                editor={editor}
                modeSelector={
                  <ModeSelector
                    currentNote={currentNote}
                    onNoteSelect={handleNoteSelect}
                    onNewNote={handleNewNote}
                    selectedProjectId={currentNote?.project_id || selectedProjectForNote?.id || currentProject?.id}
                  />
                }
              />
              <div className="min-h-[500px] p-2 sm:p-4 border rounded-lg relative">
                <div className="editor-container relative">
                  {editor && <EditorBubbleMenu editor={editor} />}
                  {editor && showLinkDialog && (
                    <LinkDialog
                      editor={editor}
                      onClose={() => setShowLinkDialog(false)}
                    />
                  )}
                  <div className="absolute top-1 right-2 text-xs text-muted-foreground">
                    {editor?.storage.characterCount.characters()} characters
                  </div>
                  <EditorContent editor={editor} />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                  <Button onClick={() => createNote.mutate()}>
                    {currentNote ? "Update Note" : "Save Note"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
