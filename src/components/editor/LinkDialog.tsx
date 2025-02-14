import React, { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, X } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"

interface LinkDialogProps {
  editor: Editor
  onClose: () => void
}

export function LinkDialog({ editor, onClose }: LinkDialogProps) {
  const [url, setUrl] = useState('https://')
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const isMobile = useIsMobile()

  useEffect(() => {
    const selection = editor.state.selection
    const { ranges } = selection
    const from = ranges[0].$from
    
    const view = editor.view
    const domRect = view.coordsAtPos(from.pos)
    const editorRect = view.dom.getBoundingClientRect()
    
    // Calculate position relative to the editor
    const top = domRect.top - editorRect.top + (isMobile ? 40 : -10)
    const left = Math.max(0, Math.min(
      domRect.left - editorRect.left - (isMobile ? 0 : 100),
      editorRect.width - 300 // Ensure dialog doesn't extend beyond editor width
    ))
    
    setPosition({ top, left })
  }, [editor, isMobile])

  const applyLink = () => {
    if (url) {
      // Make sure we select the text range before applying the link
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ 
          href: url, 
          target: '_blank',
          rel: 'noopener noreferrer'
        })
        .run();
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyLink();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="absolute bg-background border rounded-lg p-2 shadow-lg z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxWidth: 'calc(100% - 2rem)',
        width: '300px',
      }}
    >
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          applyLink();
        }} 
        className="flex items-center gap-2"
      >
        <Input
          type="url"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-8 text-sm flex-1"
          autoFocus
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-center gap-1">
          <Button 
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={applyLink}
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
  );
}