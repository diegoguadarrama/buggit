import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Link,
  AlignLeft,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Image
} from "lucide-react"

interface EditorToolbarProps {
  onFormatClick: (format: string) => void
}

export function EditorToolbar({ onFormatClick }: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-1 border rounded-lg mb-2">
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
        onClick={() => onFormatClick('image')}
      >
        <Image className="h-4 w-4" />
        <span className="sr-only">Image</span>
      </Button>
      <div className="h-4 w-px bg-border mx-2" />
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
      <div className="h-4 w-px bg-border mx-2" />
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
        <span className="sr-only">Ordered List</span>
      </Button>
      <div className="h-4 w-px bg-border mx-2" />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('align-left')}
      >
        <AlignLeft className="h-4 w-4" />
        <span className="sr-only">Align Left</span>
      </Button>
      <div className="h-4 w-px bg-border mx-2" />
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
  )
}