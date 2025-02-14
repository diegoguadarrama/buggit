import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { EditorToolbar } from './TaskEditorToolbar'; // We'll create this new component
import { BubbleMenu } from './BubbleMenu';
import { LinkDialog } from './LinkDialog'; // Add this import
import { useState } from 'react';

interface TaskDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const TaskDescriptionEditor = ({ value, onChange, placeholder }: TaskDescriptionEditorProps) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false); // Add this state
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable heading and other unnecessary features
        heading: false,
        paragraph: {
          HTMLAttributes: {
            class: 'text-xs text-gray-900 dark:text-gray-400 !leading-tight my-1', // Tighter line height and smaller margins
          },
        },
      }),
      Link.configure({
        openOnClick: true, // Change this to true
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-primary underline hover:text-primary/80 cursor-pointer'
        }
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: [
          'min-h-[100px]',
          'prose',
          'prose-xs',
          'dark:prose-invert',
          'w-full',
          'focus:outline-none',
          '[&_p]:my-1',
          '[&_ul]:my-1',
          '[&_ol]:my-1',
          '[&>*]:!leading-tight'
        ].join(' ')
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border rounded-md">
      {editor && (
        <>
          <EditorToolbar
            editor={editor}
            onFormatClick={(format) => {
              switch (format) {
                case "bold":
                  editor.chain().focus().toggleBold().run();
                  break;
                case "italic":
                  editor.chain().focus().toggleItalic().run();
                  break;
                case "bullet-list":
                  editor.chain().focus().toggleBulletList().run();
                  break;
                case "ordered-list":
                  editor.chain().focus().toggleOrderedList().run();
                  break;
                case "link":
                  if (editor.isActive('link')) {
                    editor.chain().focus().unsetLink().run();
                  } else {
                    setShowLinkDialog(true);
                  }
                  break;
              }
            }}
          />
          <div className="p-3 relative">
            <EditorContent editor={editor} />
            {showLinkDialog && (
              <LinkDialog
                editor={editor}
                onClose={() => setShowLinkDialog(false)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
