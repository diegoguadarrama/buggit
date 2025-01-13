import { NodeViewProps } from '@tiptap/react'
import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

export const ImageNodeView = ({ node }: NodeViewProps) => {
  const [showPreview, setShowPreview] = useState(false)
  const [showButton, setShowButton] = useState(false)

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowButton(true)}
      onMouseLeave={() => setShowButton(false)}
    >
      <img 
        src={node.attrs.src} 
        alt={node.attrs.alt} 
        title={node.attrs.title}
        style={{ width: '300px' }}
        onDoubleClick={() => setShowPreview(true)}
      />
      {showButton && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 opacity-80 hover:opacity-100"
          onClick={() => setShowPreview(true)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      )}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-screen-lg">
          <img 
            src={node.attrs.src} 
            alt={node.attrs.alt} 
            title={node.attrs.title}
            className="w-full h-auto"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 