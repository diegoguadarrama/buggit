import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Image,
  Pilcrow,
  Highlighter,
  Palette,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface EditorToolbarProps {
  onFormatClick: (format: string) => void
  editor: any
}

const colors = [
  { name: 'Default', color: '#000000' },
  { name: 'Purple', color: '#9333EA' },
  { name: 'Red', color: '#E00000' },
  { name: 'Blue', color: '#2563EB' },
  { name: 'Green', color: '#008A00' },
  { name: 'Orange', color: '#FFA500' },
]

export function EditorToolbar({ onFormatClick, editor }: EditorToolbarProps) {
  if (!editor) {
    return null
  }

  const setColor = (color: string) => {
    if (color === '#000000') {
      editor.chain().focus().unsetColor().run()
    } else {
      editor.chain().focus().setColor(color).run()
    }
  }

  return (
    <div className="flex items-center gap-1 p-1 border rounded-lg mb-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        onClick={() => onFormatClick('bold')}
        data-active={editor.isActive('bold')}
      >
        <Bold className="h-4 w-4" />
        <span className="sr-only">Bold</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        onClick={() => onFormatClick('italic')}
        data-active={editor.isActive('italic')}
      >
        <Italic className="h-4 w-4" />
        <span className="sr-only">Italic</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        onClick={() => onFormatClick('highlight')}
        data-active={editor.isActive('highlight')}
      >
        <Highlighter className="h-4 w-4" />
        <span className="sr-only">Highlight</span>
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            data-active={editor.isActive('textStyle', { color: colors.map(c => c.color) })}
          >
            <Palette className="h-4 w-4" />
            <span className="sr-only">Text color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2">
          <div className="grid grid-cols-3 gap-1">
            {colors.map((item) => (
              <button
                key={item.color}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded hover:bg-muted"
                onClick={() => setColor(item.color)}
              >
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs">{item.name}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
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
        className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        onClick={() => onFormatClick('paragraph')}
        data-active={editor.isActive('paragraph')}
      >
        <Pilcrow className="h-4 w-4" />
        <span className="sr-only">Paragraph</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        onClick={() => onFormatClick('h1')}
        data-active={editor.isActive('heading', { level: 1 })}
      >
        <Heading1 className="h-4 w-4" />
        <span className="sr-only">Heading 1</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        onClick={() => onFormatClick('h2')}
        data-active={editor.isActive('heading', { level: 2 })}
      >
        <Heading2 className="h-4 w-4" />
        <span className="sr-only">Heading 2</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        onClick={() => onFormatClick('h3')}
        data-active={editor.isActive('heading', { level: 3 })}
      >
        <Heading3 className="h-4 w-4" />
        <span className="sr-only">Heading 3</span>
      </Button>
      <div className="h-4 w-px bg-border mx-2" />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        onClick={() => onFormatClick('bullet-list')}
        data-active={editor.isActive('bulletList')}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">Bullet List</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        onClick={() => onFormatClick('ordered-list')}
        data-active={editor.isActive('orderedList')}
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
