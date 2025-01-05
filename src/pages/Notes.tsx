import { useState } from "react"
import { EditorToolbar } from "@/components/editor/EditorToolbar"
import { FloatingFormatToolbar } from "@/components/editor/FloatingFormatToolbar"
import { ModeSelector } from "@/components/editor/ModeSelector"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tag } from 'lucide-react'
import { useAuth } from "@/components/AuthProvider"
import { useProject } from "@/components/ProjectContext"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export default function Notes() {
  const [currentMode, setCurrentMode] = useState('jots')
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const { user } = useAuth()
  const { currentProject } = useProject()
  const { toast } = useToast()
  const queryClient = useQueryClient()

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
      if (!user || !currentProject) return

      const { data, error } = await supabase.from("notes").insert([
        {
          title,
          content,
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
      setContent("")
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
    const editor = document.querySelector('[contenteditable="true"]') as HTMLElement
    if (!editor) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()

    // Create a new element with the appropriate styling
    const formattedSpan = document.createElement('span')
    formattedSpan.textContent = selectedText

    switch (format) {
      case 'bold':
        formattedSpan.style.fontWeight = 'bold'
        break
      case 'italic':
        formattedSpan.style.fontStyle = 'italic'
        break
      case 'link':
        const url = prompt('Enter URL:', 'https://')
        if (url) {
          const link = document.createElement('a')
          link.href = url
          link.textContent = selectedText
          formattedSpan.appendChild(link)
        }
        break
      case 'list':
        const li = document.createElement('li')
        li.textContent = selectedText
        formattedSpan.appendChild(li)
        break
      case 'align':
        editor.style.textAlign = 'left'
        break
    }

    // Replace the selected text with the formatted element
    range.deleteContents()
    range.insertNode(formattedSpan)
    
    // Update the content state with the new HTML
    setContent(editor.innerHTML)
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
          <div className="min-h-[500px] p-4 border rounded-lg relative">
            <div
              contentEditable
              className="min-h-[400px] w-full resize-none focus:outline-none p-2 border rounded"
              onInput={(e) => {
                const newContent = e.currentTarget.innerHTML
                if (newContent !== content) {
                  setContent(newContent)
                }
              }}
              suppressContentEditableWarning
            >
              {content}
            </div>
            <FloatingFormatToolbar onFormatClick={handleFormatClick} />
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