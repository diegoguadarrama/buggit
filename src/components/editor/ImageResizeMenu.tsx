import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';

interface ImageResizeMenuProps {
  editor: Editor;
}

export function ImageResizeMenu({ editor }: ImageResizeMenuProps) {
  const setImageSize = (size: 'small' | 'medium' | 'original') => {
    const sizes = {
      small: 'w-1/4 mx-auto', // 25% width, centered
      medium: 'w-1/2 mx-auto', // 50% width, centered
      original: 'w-full' // 100% width
    };

    editor.chain().focus().run();
    
    // Since we're already checking isActive('image') below,
    // we can simply update the attributes if an image is selected
    editor.chain().focus().updateAttributes('image', {
      class: `rounded-lg ${sizes[size]} block`
    }).run();
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
