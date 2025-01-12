import { BubbleMenu, Editor } from "@tiptap/react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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

interface EditorBubbleMenuProps {
  editor: Editor
  onLinkAdd?: () => void
  onCreateTask?: (selectedText: string) => void
}

export const EditorBubbleMenu = ({ editor, onLinkAdd, onCreateTask }: EditorBubbleMenuProps) => {
  const handleCreateTask = () => {
    if (!onCreateTask) return
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' '
    )
    onCreateTask(selectedText)
  }

  return (
    <BubbleMenu
      className="flex w-fit divide-x divide-border rounded-lg border border-border bg-background shadow-md"
      editor={editor}
    >
      <div className="flex items-center">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          className="px-3"
          size="sm"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          className="px-3"
          size="sm"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          variant={editor.isActive("strike") ? "secondary" : "ghost"}
          className="px-3"
          size="sm"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          variant={editor.isActive("highlight") ? "secondary" : "ghost"}
          className="px-3"
          size="sm"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
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
                  // If there's a link in the selection, apply it to the entire selection
                  editor.chain().focus().setLink({ href: url }).run()
                } else {
                  onLinkAdd()
                }
              }
            }}
            className={cn(editor.isActive('link') && 'bg-muted')}
          >
            <Link2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center">
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
          className="px-3"
          size="sm"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
          className="px-3"
          size="sm"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
          className="px-3"
          size="sm"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setParagraph().run()}
          variant={editor.isActive("paragraph") ? "secondary" : "ghost"}
          className="px-3"
          size="sm"
        >
          <Pilcrow className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center">
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          className="px-3"
          size="sm"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          className="px-3"
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
                  className="px-3"
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