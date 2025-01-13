import { NodeViewProps } from '@tiptap/react'
import { Maximize2 } from 'lucide-react'

export const ImagePreviewComponent = ({ node, updateAttributes }: NodeViewProps) => {
  const handlePreview = () => {
    // Access the global preview handler
    if (window.handleImagePreview) {
      window.handleImagePreview(node.attrs.src)
    }
  }

  return (
    <div className="relative inline-block group">
      <img
        src={node.attrs.src}
        className="rounded-md"
        style={{ width: '300px', height: 'auto' }}
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handlePreview}
          className="p-1 bg-background/80 backdrop-blur-sm rounded-md hover:bg-background/90 transition-colors"
          type="button"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Add type declaration for the global preview handler
declare global {
  interface Window {
    handleImagePreview?: (src: string) => void;
  }
} 