// src/components/editor/extensions/ImageWithPreview.ts

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImageNodeView } from '@/pages/Notes'
import { supabase } from '@/integrations/supabase/client'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageWithPreview: {
      setImage: (options: { src: string }) => ReturnType
      removeImage: (src: string) => ReturnType
    }
  }
}

export const ImageWithPreview = Node.create({
  name: 'imageWithPreview',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },

  // Add this function to handle node deletion
  onDestroy() {
    return ({ node }) => {
      const imageUrl = node.attrs.src;
      if (!imageUrl) return;

      // Extract filename from the URL
      const fileName = imageUrl.split('/').pop();
      if (!fileName) return;

      // Only delete if it's from our storage bucket
      if (imageUrl.includes('notes-images')) {
        // Delete the file from storage
        supabase.storage
          .from("notes-images")
          .remove([fileName])
          .then(({ error }) => {
            if (error) {
              console.error("Error deleting image from storage:", error);
            }
          });
      }
    };
  },

  addCommands() {
    return {
      setImage:
        options =>
        ({ commands }) => {
          return commands.insertContent({
            type: 'imageWithPreview',
            attrs: options,
          })
        },
      removeImage:
        src =>
        ({ commands }) => {
          // First handle storage deletion
          const fileName = src.split('/').pop();
          if (fileName && src.includes('notes-images')) {
            supabase.storage
              .from("notes-images")
              .remove([fileName])
              .then(({ error }) => {
                if (error) {
                  console.error("Error deleting image from storage:", error);
                }
              });
          }
          // Then remove from editor
          return commands.deleteSelection()
        },
    }
  },
})
