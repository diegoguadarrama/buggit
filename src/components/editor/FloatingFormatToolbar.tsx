import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Link, AlignLeft, List } from "lucide-react"

interface FloatingFormatToolbarProps {
  onFormatClick: (format: string) => void
}

export function FloatingFormatToolbar({ onFormatClick }: FloatingFormatToolbarProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      const textarea = document.querySelector('textarea')
      
      if (!selection || selection.isCollapsed || !textarea) {
        setIsVisible(false)
        return
      }

      // Only show toolbar if selection is within the textarea
      if (!textarea.contains(selection.anchorNode)) {
        setIsVisible(false)
        return
      }

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      if (rect.width > 0) {
        // Get textarea position
        const textareaRect = textarea.getBoundingClientRect()
        
        // Calculate position relative to the viewport
        const top = rect.top - textareaRect.top + textarea.scrollTop
        const left = rect.left - textareaRect.left + textarea.scrollLeft + (rect.width / 2)
        
        setPosition({
          top: top,
          left: left
        })
        setIsVisible(true)

        console.log('Selection detected, showing toolbar at:', { top, left })
      }
    }

    // Listen for both selectionchange and mouseup events
    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('mouseup', handleSelectionChange)
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mouseup', handleSelectionChange)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div 
      className="absolute z-50 flex items-center gap-1 p-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg"
      style={{ 
        top: `${position.top - 40}px`, 
        left: `${position.left - 100}px`,
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('bold')}
      >
        <Bold className="h-4 w-4" />
        <span className="sr-only">Bold</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('italic')}
      >
        <Italic className="h-4 w-4" />
        <span className="sr-only">Italic</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('link')}
      >
        <Link className="h-4 w-4" />
        <span className="sr-only">Link</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('list')}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('align')}
      >
        <AlignLeft className="h-4 w-4" />
        <span className="sr-only">Align</span>
      </Button>
    </div>
  )
}