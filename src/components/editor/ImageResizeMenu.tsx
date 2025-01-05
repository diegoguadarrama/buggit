import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';

interface ImageResizeMenuProps {
  editor: Editor;
}

export function ImageResizeMenu({ editor }: ImageResizeMenuProps) {
  const setImageSize = (size: 'small' | 'medium' | 'original') => {
    const sizes = {
      small: 'w-1/4',
      medium: 'w-1/2',
      original: 'w-full'
    };

    editor.chain().focus().run();
    
    const imageNode = editor.state.selection.node;
    if (imageNode && imageNode.type.name === 'image') {
      editor.chain().focus().updateAttributes('image', {
        class: `rounded-lg max-w-full ${sizes[size]}`
      }).run();
    }
  };

  if (!editor.isActive('image')) return null;

  return (
    <div className="fixed z-50 bg-background border rounded-lg shadow-lg p-2 flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setImageSize('small')}
      >
        Small
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setImageSize('medium')}
      >
        Medium
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setImageSize('original')}
      >
        Original
      </Button>
    </div>
  );
}