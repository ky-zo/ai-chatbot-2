'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { defaultMarkdownSerializer } from 'prosemirror-markdown'

import { buildDocumentFromContent } from '@/lib/editor/functions'

const Tiptap = ({ content }: { content: string }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
  })

  return <EditorContent editor={editor} />
}

export default Tiptap
