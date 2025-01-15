import React from 'react'
import { Plus, Image, Code } from 'lucide-react'

interface PlusMenuProps {
  onImageClick: () => void
  onCodeBlockClick: () => void
}

export function PlusMenu({ onImageClick, onCodeBlockClick }: PlusMenuProps) {
  return (
    <div className="plus-menu">
      <button className="plus-menu-button">
        <Plus className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="plus-menu-dropdown">
        <div className="plus-menu-item" onClick={onImageClick}>
          <Image className="h-4 w-4" />
          <span>Image</span>
        </div>
        <div className="plus-menu-item" onClick={onCodeBlockClick}>
          <Code className="h-4 w-4" />
          <span>Code Block</span>
        </div>
      </div>
    </div>
  )
}