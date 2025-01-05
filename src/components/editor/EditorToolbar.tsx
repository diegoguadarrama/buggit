import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, LinkIcon, Undo, Redo, AlignLeft } from 'lucide-react'

interface EditorToolbarProps {
  onFormatClick: (format: string) => void
}

export function EditorToolbar({ onFormatClick }: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-1 border rounded-md bg-background">
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
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('align-left')}
      >
        <AlignLeft className="h-4 w-4" />
        <span className="sr-only">Align Left</span>
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('h1')}
      >
        <Heading1 className="h-4 w-4" />
        <span className="sr-only">Heading 1</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('h2')}
      >
        <Heading2 className="h-4 w-4" />
        <span className="sr-only">Heading 2</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('h3')}
      >
        <Heading3 className="h-4 w-4" />
        <span className="sr-only">Heading 3</span>
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('bullet-list')}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">Bullet List</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('ordered-list')}
      >
        <ListOrdered className="h-4 w-4" />
        <span className="sr-only">Numbered List</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('link')}
      >
        <LinkIcon className="h-4 w-4" />
        <span className="sr-only">Link</span>
      </Button>
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onFormatClick('undo')}
        >
          <Undo className="h-4 w-4" />
          <span className="sr-only">Undo</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onFormatClick('redo')}
        >
          <Redo className="h-4 w-4" />
          <span className="sr-only">Redo</span>
        </Button>
      </div>
    </div>
  )
}