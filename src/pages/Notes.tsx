import { useState } from "react"
import { EditorToolbar } from "@/components/editor/EditorToolbar"
import { FloatingFormatToolbar } from "@/components/editor/FloatingFormatToolbar"
import { ModeSelector } from "@/components/editor/ModeSelector"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    let formattedText = selectedText

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'link':
        formattedText = `[${selectedText}](url)`
        break
      case 'list':
        formattedText = `\n- ${selectedText}`
        break
      case 'align':
        formattedText = `\n::: ${selectedText}\n:::`
        break
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end)
    setContent(newContent)
    
    // Restore focus and selection
    textarea.focus()
    setTimeout(() => {
      textarea.setSelectionRange(start, start + formattedText.length)
    }, 0)

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
        <FloatingFormatToolbar onFormatClick={handleFormatClick} />
        <div className="grid grid-cols-[240px_1fr] gap-4 mt-4">
          <ModeSelector
            currentMode={currentMode}
            onModeChange={setCurrentMode}
          />
          <div className="min-h-[500px] p-4 border rounded-lg">
            <Textarea 
              placeholder="Start writing your note..."
              className="min-h-[400px] w-full resize-none focus:outline-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
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