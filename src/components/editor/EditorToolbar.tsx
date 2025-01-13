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
  FileText,
  ChevronDown,
  Lock,
  Users,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Editor } from '@tiptap/react'
import { Checkbox } from "@/components/ui/checkbox"

interface EditorToolbarProps {
  editor: Editor | null
  onFormatClick: (format: string) => void
  modeSelector?: React.ReactNode
  isPrivate?: boolean
  onVisibilityChange?: (isPrivate: boolean) => void
  isNoteOwner?: boolean
}

const colors = [
  { name: 'Default', color: '#000000' },
  { name: 'Purple', color: '#9333EA' },
  { name: 'Red', color: '#E00000' },
  { name: 'Blue', color: '#2563EB' },
  { name: 'Green', color: '#008A00' },
  { name: 'Orange', color: '#FFA500' },
]

const highlightColors = [
  { name: 'Blue', color: '#bfdbfe', letter: 'T' },
  { name: 'Purple', color: '#e9d5ff', letter: 'T' },
  { name: 'Orange', color: '#fed7aa', letter: 'T' },
  { name: 'Red', color: '#fca5a5', letter: 'T' },
  { name: 'Yellow', color: '#fef08a', letter: 'T' },
  { name: 'Green', color: '#bbf7d0', letter: 'T' },
]

export function EditorToolbar({ 
  editor, 
  onFormatClick, 
  modeSelector,
  isPrivate = false,
  onVisibilityChange,
  isNoteOwner = false,
}: EditorToolbarProps) {
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

  const setHighlight = (color: string) => {
    if (editor.isActive('highlight', { color })) {
      editor.chain().focus().unsetHighlight().run()
    } else {
      editor.chain().focus().setHighlight({ color }).run()
    }
  }

  return (
    <div className="border rounded-lg p-1 flex flex-wrap items-center gap-1">
      <div className="lg:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Notes
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            {modeSelector}
          </PopoverContent>
        </Popover>
      </div>
      <div className="h-6 w-px bg-border lg:hidden" />
      {onVisibilityChange && isNoteOwner && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    isPrivate ? "text-yellow-500" : "text-green-500"
                  )}
                  onClick={() => onVisibilityChange(!isPrivate)}
                >
                  {isPrivate ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isPrivate ? "Private" : "Project"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  {isPrivate
                    ? "Private - Only visible to you"
                    : "Project - Visible to all project members"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="h-4 w-px bg-border" />
        </>
      )}
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
        className="h-8 w-8 p-0"
        onClick={() => onFormatClick('italic')}
        data-active={editor.isActive('italic')}
      >
        <Italic className="h-4 w-4" />
        <span className="sr-only">Italic</span>
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            data-active={editor.isActive('highlight')}
          >
            <Highlighter className="h-4 w-4" />
            <span className="sr-only">Highlight</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-58 p-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground mb-2">Pick a color...</p>
            <div className="space-y-2">
              {highlightColors.map((item) => (
                <div 
                  key={item.color} 
                  className="flex items-center justify-between py-1.5 px-2 hover:bg-muted rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded flex items-center justify-center text-sm font-medium"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.letter}
                    </div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <Checkbox 
                    id={`highlight-${item.color}`}
                    checked={editor.isActive('highlight', { color: item.color })}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        editor.chain().focus().setHighlight({ color: item.color }).run()
                      } else {
                        editor.chain().focus().unsetHighlight().run()
                      }
                    }}
                    className="h-5 w-5 border-2 border-muted-foreground/20 data-[state=checked]:border-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 data-[active=true]:bg-muted"
        onClick={() => onFormatClick('link')}
        data-active={editor.isActive('link')}
      >
        <Link className="h-4 w-4" />
        <span className="sr-only">Link</span>
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
