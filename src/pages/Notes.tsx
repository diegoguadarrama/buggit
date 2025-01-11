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
import "@/components/editor/Editor.css"

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
  const [currentMode, setCurrentMode] = useState('jots')
  const [title, setTitle] = useState("")
  const { user } = useAuth()
  const { currentProject } = useProject()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)

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
      case 'link':
        if (editor.isActive('link')) {
          editor.chain().focus().unsetLink().run()
          console.log('Removed link from text')
        } else {
          const url = prompt('Enter URL:', 'https://')
          if (url) {
            editor.chain()
              .focus()
              .setLink({ href: url, target: '_blank' })
              .run()
            console.log('Added link to text:', url)
          }
        }
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
        <EditorToolbar onFormatClick={handleFormatClick} editor={editor} />
        <div className="grid grid-cols-[240px_1fr] gap-4 mt-4">
          <ModeSelector
            currentMode={currentMode}
            onModeChange={setCurrentMode}
          />
          <div className="min-h-[500px] p-4 border rounded-lg relative">
            <div className="editor-container relative">
              {editor && <EditorBubbleMenu editor={editor} />}
              <div className="absolute top-2 right-2 text-sm text-muted-foreground">
                {editor?.storage.characterCount.characters()} characters
              </div>
              <EditorContent editor={editor} />
            </div>
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
