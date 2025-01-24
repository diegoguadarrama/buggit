import { BubbleMenu, Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Bold,
  Italic,
  Strikethrough,
  Highlighter,
  Link2,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  SquareKanban,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const highlightColors = [
  { name: 'Blue', color: '#bfdbfe', letter: 'T' },
  { name: 'Purple', color: '#e9d5ff', letter: 'T' },
  { name: 'Orange', color: '#fed7aa', letter: 'T' },
  { name: 'Red', color: '#fca5a5', letter: 'T' },
  { name: 'Yellow', color: '#fef08a', letter: 'T' },
  { name: 'Green', color: '#bbf7d0', letter: 'T' },
]

interface EditorBubbleMenuProps {
  editor: Editor
  onLinkAdd?: () => void
  onCreateTask?: (selectedText: string) => Promise<string>
}

export const EditorBubbleMenu = ({ editor, onLinkAdd, onCreateTask }: EditorBubbleMenuProps) => {
  const isMobile = useIsMobile()
  
  const handleCreateTask = () => {
    if (!onCreateTask) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (selectedText) {
      onCreateTask(selectedText);
      editor.commands.setTextSelection(from);
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
    <BubbleMenu
      className={cn(
        "flex w-fit divide-x divide-border rounded-lg border border-border bg-background shadow-md",
        isMobile && "flex-wrap max-w-[calc(100vw-2rem)] mx-4"
      )}
      editor={editor}
      tippyOptions={{
        maxWidth: '100vw',
        placement: isMobile ? 'bottom' : 'top',
      }}
    >
      <div className={cn(
        "flex items-center",
        isMobile && "flex-wrap"
      )}>
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          className="px-2 sm:px-3"
          size="sm"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          className="px-2 sm:px-3"
          size="sm"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          variant={editor.isActive("strike") ? "secondary" : "ghost"}
          className="px-2 sm:px-3"
          size="sm"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={editor.isActive("highlight") ? "secondary" : "ghost"}
              className="px-2 sm:px-3"
              size="sm"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-58 p-3" 
            side={isMobile ? "bottom" : "top"}
            align="start"
            alignOffset={0}
            sideOffset={5}
            avoidCollisions={true}
          >
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
                      id={`bubble-highlight-${item.color}`}
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
        {onLinkAdd && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run()
              } else {
                const url = editor.getAttributes('link').href
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run()
                } else {
                  onLinkAdd()
                }
              }
            }}
            className={cn(
              editor.isActive('link') && 'bg-muted',
              "px-2 sm:px-3"
            )}
          >
            <Link2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className={cn(
        "flex items-center",
        isMobile && "flex-wrap"
      )}>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
          className="px-2 sm:px-3"
          size="sm"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
          className="px-2 sm:px-3"
          size="sm"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
          className="px-2 sm:px-3"
          size="sm"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setParagraph().run()}
          variant={editor.isActive("paragraph") ? "secondary" : "ghost"}
          className="px-2 sm:px-3"
          size="sm"
        >
          <Pilcrow className="h-4 w-4" />
        </Button>
      </div>
      <div className={cn(
        "flex items-center",
        isMobile && "flex-wrap"
      )}>
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          className="px-2 sm:px-3"
          size="sm"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          className="px-2 sm:px-3"
          size="sm"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        {onCreateTask && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCreateTask}
                  variant="ghost"
                  className="px-2 sm:px-3"
                  size="sm"
                >
                  <SquareKanban className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a Task</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </BubbleMenu>
  )
}