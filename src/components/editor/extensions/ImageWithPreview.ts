import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImageNodeView } from '../ImageNodeView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageWithPreview: {
      setImage: (options: { src: string }) => ReturnType
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
    }
  },
})