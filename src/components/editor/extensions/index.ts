import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { ImageWithPreview } from './ImageWithPreview'

export const extensions = [
  StarterKit,
  Link.configure({
    openOnClick: true,
    HTMLAttributes: {
      target: '_blank',
      rel: 'noopener noreferrer',
      class: 'cursor-pointer'
    },
    validate: (href: string) => /^https?:\/\//.test(href),
  }),
  Highlight.configure({ multicolor: true }),
  TextStyle,
  Color,
  ImageWithPreview,
]