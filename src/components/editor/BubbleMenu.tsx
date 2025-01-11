import React, { useState } from 'react'
import { BubbleMenu, Editor } from '@tiptap/react'
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Highlighter,
  Pilcrow,
} from "lucide-react"
import { LinkDialog } from './LinkDialog'

interface EditorBubbleMenuProps {
  editor: Editor
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)

  if (!editor) {
    return null
  }

  const handleLinkClick = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
    } else {
      setShowLinkDialog(true)
    }
  }

  const shouldShow = ({ editor, state, from, to }: any) => {
    const { empty } = state.selection
    return !showLinkDialog && !empty && from !== to
  }

  return (
    <>
      <BubbleMenu 
        className="flex items-center gap-1 p-1 border rounded-lg bg-background shadow-lg"
        tippyOptions={{ 
          duration: 100,
          placement: 'top',
          trigger: 'manual',
          onHide: () => {
            editor.commands.focus()
          }
        }}
        shouldShow={shouldShow}
        editor={editor}
      >
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive('bold')}
        >
          <Bold className="h-4 w-4" />
          <span className="sr-only">Bold</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive('italic')}
        >
          <Italic className="h-4 w-4" />
          <span className="sr-only">Italic</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          data-active={editor.isActive('highlight')}
        >
          <Highlighter className="h-4 w-4" />
          <span className="sr-only">Highlight</span>
        </Button>
        <div className="h-4 w-px bg-border mx-2" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
          onClick={handleLinkClick}
          data-active={editor.isActive('link')}
        >
          <LinkIcon className="h-4 w-4" />
          <span className="sr-only">Link</span>
        </Button>
        <div className="h-4 w-px bg-border mx-2" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
          onClick={() => editor.chain().focus().setParagraph().run()}
          data-active={editor.isActive('paragraph')}
        >
          <Pilcrow className="h-4 w-4" />
          <span className="sr-only">Paragraph</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          data-active={editor.isActive('heading', { level: 1 })}
        >
          <Heading1 className="h-4 w-4" />
          <span className="sr-only">Heading 1</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          data-active={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
          <span className="sr-only">Heading 2</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
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
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive('bulletList')}
        >
          <List className="h-4 w-4" />
          <span className="sr-only">Bullet List</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 data-[active=true]:bg-muted"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive('orderedList')}
        >
          <ListOrdered className="h-4 w-4" />
          <span className="sr-only">Ordered List</span>
        </Button>
      </BubbleMenu>
      {showLinkDialog && (
        <LinkDialog 
          editor={editor} 
          onClose={() => setShowLinkDialog(false)} 
        />
      )}
    </>
  )
} 