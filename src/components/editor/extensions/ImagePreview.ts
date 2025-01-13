import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImagePreviewComponent } from './ImagePreviewComponent'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imagePreview: {
      setImage: (options: { src: string }) => ReturnType
    }
  }
}

export const ImagePreview = Node.create({
  name: 'imagePreview',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
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
    return ReactNodeViewRenderer(ImagePreviewComponent)
  },

  addCommands() {
    return {
      setImage:
        options =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
}) 