import { useState } from "react"
import { EditorToolbar } from "@/components/editor/EditorToolbar"
import { ModeSelector } from "@/components/editor/ModeSelector"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tag } from 'lucide-react'
import { useAuth } from "@/components/AuthProvider"
import { useProject } from "@/components/ProjectContext"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import "@/components/editor/Editor.css"

export default function Notes() {
  const [currentMode, setCurrentMode] = useState('jots')
  const [title, setTitle] = useState("")
  const { user } = useAuth()
  const { currentProject } = useProject()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      console.log('Content updated:', editor.getHTML())
    },
  })

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
      if (!user || !currentProject || !editor) return

      const { data, error } = await supabase.from("notes").insert([
        {
          title,
          content: editor.getHTML(),
          user_id: user.id,
          project_id: currentProject.id,
        },
      ])

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      setTitle("")
      editor?.commands.setContent('')
      toast({
        title: "Success",
        description: "Note created successfully",
      })
    },
    onError: (error) => {
      console.error("Error creating note:", error)
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      })
    },
  })

  const handleFormatClick = (format: string) => {
    if (!editor) return

    console.log('Format clicked:', format)

    switch (format) {
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
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
      case 'link':
        const url = prompt('Enter URL:', 'https://')
        if (url) {
          editor.chain().focus().setLink({ href: url }).run()
        }
        break
      case 'align-left':
        // TipTap doesn't have built-in alignment, we can add it later if needed
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-4">
          <Input
            type="text"
            placeholder="Note title"
            className="text-xl font-semibold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button variant="outline" size="sm" className="gap-2">
            <Tag className="h-4 w-4" />
            Add a tag
          </Button>
        </div>
        <EditorToolbar onFormatClick={handleFormatClick} />
        <div className="grid grid-cols-[240px_1fr] gap-4 mt-4">
          <ModeSelector
            currentMode={currentMode}
            onModeChange={setCurrentMode}
          />
          <div className="min-h-[500px] p-4 border rounded-lg">
            <EditorContent editor={editor} />
            <div className="mt-4 flex justify-end">
              <Button onClick={() => createNote.mutate()}>
                Save Note
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}