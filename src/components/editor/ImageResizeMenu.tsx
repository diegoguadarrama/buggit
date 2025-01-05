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
    
    // Get the selected node using the correct method
    const node = editor.state.selection.node;
    const isImage = editor.isActive('image');
    
    if (isImage) {
      editor.chain().focus().updateAttributes('image', {
        class: `rounded-lg max-w-full ${sizes[size]}`
      }).run();
    }
  };

  // Only show menu when an image is selected
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