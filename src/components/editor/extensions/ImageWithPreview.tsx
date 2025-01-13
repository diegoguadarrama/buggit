import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { NodeViewProps } from '@tiptap/react'
import { Maximize2 } from 'lucide-react'

const ImageWithPreviewComponent = ({ node }: NodeViewProps) => {
  return (
    <div className="relative inline-block group">
      <img
        src={node.attrs.src}
        className="rounded-md"
        style={{ width: '300px', height: 'auto' }}
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => window.handleImagePreview?.(node.attrs.src)}
          className="p-1 bg-background/80 backdrop-blur-sm rounded-md hover:bg-background/90 transition-colors"
          type="button"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageWithPreview: {
      setImage: (options: { src: string }) => ReturnType
    }
  }
}

export const ImageWithPreview = Node.create({
  name: 'image',
  group: 'block',
  inline: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
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
    return ReactNodeViewRenderer(ImageWithPreviewComponent)
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