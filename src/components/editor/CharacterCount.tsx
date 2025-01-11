import React from 'react'
import { Editor } from '@tiptap/react'

interface CharacterCountProps {
  editor: Editor
}

export function CharacterCount({ editor }: CharacterCountProps) {
  if (!editor) {
    return null
  }

  const characterCount = editor.storage.characterCount.characters()
  const wordCount = editor.storage.characterCount.words()

  return (
    <div className="text-sm text-muted-foreground">
      {characterCount} characters · {wordCount} words
    </div>
  )
} 