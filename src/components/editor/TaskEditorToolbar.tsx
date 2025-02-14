import { type Editor } from '@tiptap/react';
import { Bold, Italic, List, ListOrdered, Link } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

interface EditorToolbarProps {
  editor: Editor;
  onFormatClick: (format: string) => void;
}

export const EditorToolbar = ({ editor, onFormatClick }: EditorToolbarProps) => {
  return (
    <div className="border-b p-1 flex gap-1">
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => onFormatClick('bold')}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => onFormatClick('italic')}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => onFormatClick('bullet-list')}
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => onFormatClick('ordered-list')}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('link')}
        onPressedChange={() => onFormatClick('link')}
      >
        <Link className="h-4 w-4" />
      </Toggle>
    </div>
  );
};
