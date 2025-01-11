import React, { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, X } from 'lucide-react'

interface LinkDialogProps {
  editor: Editor
  onClose: () => void
}

export function LinkDialog({ editor, onClose }: LinkDialogProps) {
  const [url, setUrl] = useState('https://')
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const selection = editor.state.selection
    const { ranges } = selection
    const from = ranges[0].$from
    const to = ranges[0].$to
    
    const view = editor.view
    const domRect = view.coordsAtPos(from.pos)
    const editorRect = view.dom.getBoundingClientRect()
    
    setPosition({
      top: domRect.top - editorRect.top - 10,
      left: domRect.left - editorRect.left,
    })
  }, [editor])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      editor.chain()
        .focus()
        .setLink({ href: url, target: '_blank' })
        .run()
    }
    onClose()
  }

  return (
    <div
      className="absolute bg-background border rounded-lg p-2 shadow-lg z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="url"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-8 text-sm min-w-[200px]"
          autoFocus
        />
        <div className="flex items-center gap-1">
          <Button 
            type="submit" 
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Confirm</span>
          </Button>
          <Button 
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cancel</span>
          </Button>
        </div>
      </form>
    </div>
  )
} 