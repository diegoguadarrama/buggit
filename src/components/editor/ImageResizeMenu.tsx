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

    if (editor.isActive('image')) {
      console.log('Setting image size to:', size);
      
      // Get the current attributes
      const attrs = editor.getAttributes('image');
      console.log('Current attributes:', attrs);
      
      // Create new class string
      const newClass = `rounded-lg block ${sizes[size]}`;
      console.log('New class:', newClass);
      
      // Force update the attributes using updateAttributes instead of setImage
      editor
        .chain()
        .focus()
        .updateAttributes('image', {
          ...attrs,
          HTMLAttributes: {
            class: newClass,
          },
        })
        .run();
        
      console.log('Updated image attributes');
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