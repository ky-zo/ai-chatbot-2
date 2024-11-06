import { NextResponse } from 'next/server'
import * as mammoth from 'mammoth'
import pdfParse from 'pdf-parse'
import { defaultMarkdownParser, defaultMarkdownSerializer, MarkdownParser, MarkdownSerializer } from 'prosemirror-markdown'
import { Schema } from 'prosemirror-model'
import { z } from 'zod'

import { getUser } from '@/db/queries'
import { documentSchema } from '@/lib/editor/config'

const FileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size should be less than 5MB',
    })
    .refine(
      (file) =>
        [
          'application/pdf', //pdf
          'application/msword', // .doc
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        ].includes(file.type),
      {
        message: 'File type should be PDF, DOC, or DOCX',
      }
    ),
})

// async function extractMarkdownFromPDF(buffer: Buffer): Promise<string> {
//   const data = await pdfParse(buffer)
//   // Convert PDF text to markdown-friendly format
//   // Split by double newlines to separate paragraphs
//   const paragraphs = data.text.split(/\n\s*\n/)
//   return paragraphs
//     .map((p) => p.trim())
//     .filter((p) => p.length > 0)
//     .join('\n\n')
// }

async function extractMarkdownFromDOCX(arrayBuffer: ArrayBuffer): Promise<string> {
  // Convert to HTML first, with custom options to preserve structure

  const options = {
    styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Code'] => pre:fresh",
    ],
  }

  try {
    // Pass the array buffer directly to mammoth
    const result = await mammoth.convertToHtml({
      arrayBuffer: arrayBuffer,
    })

    console.log('🟣 |  result:', result)

    // Get the raw text content
    // const text = result.value

    // // Convert to markdown using ProseMirror
    // // First create paragraphs by splitting on double newlines
    // const formattedText = text
    //   .split(/\n\s*\n/)
    //   .map((para) => para.trim())
    //   .filter((para) => para.length > 0)
    //   .join('\n\n')

    // Parse and serialize to markdown
    return defaultMarkdownSerializer.serialize(defaultMarkdownParser.parse(formattedText))
  } catch (error) {
    console.error('DOCX processing error:', error)
    throw new Error('Failed to process DOCX file: ' + (error as Error).message)
  }

  // Convert HTML to ProseMirror doc and then to markdown
  //  const div = document.createElement('div')
  //div.innerHTML = result.value

  // Use your existing schema
  // const serializer = new MarkdownSerializer(documentSchema.nodes, documentSchema.marks)
  // const parser = new MarkdownParser(documentSchema, {}, {})

  //return defaultMarkdownSerializer.serialize(defaultMarkdownParser.parse(div.textContent || ''))
}

export async function POST(request: Request) {
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const validatedFile = FileSchema.safeParse({ file })

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors.map((error) => error.message).join(', ')
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const filename = file.name
    const fileBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(fileBuffer)

    try {
      let content = ''

      switch (file.type) {
        case 'application/pdf':
          // content = await extractMarkdownFromPDF(buffer)
          return NextResponse.json({ error: 'PDF not implemented' }, { status: 500 })
          break
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          content = await extractMarkdownFromDOCX(fileBuffer)
          break
        default:
          return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
      }

      console.log('🟣 |  content:', content)
      console.log('🟣 |  filename:', filename)

      return NextResponse.json({
        content,
        filename,
      })
    } catch (error) {
      console.error('Processing error:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
  } catch (error) {
    console.error('Request error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
