import { NextResponse } from 'next/server'
import mammoth from 'mammoth'
import TurndownService from 'turndown'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

import { getUser, saveDocument } from '@/db/queries'

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

async function extractMarkdownFromDOCX(buffer: Buffer): Promise<string> {
  const options = {
    styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Code'] => pre:fresh",
      "p[style-name='List Paragraph'] => ul > li:fresh",
      "r[style-name='Strong'] => strong",
      "r[style-name='Emphasis'] => em",
      "p[style-name='Quote'] => blockquote:fresh",
      "r[style-name='Code'] => code",
      "p[style-name='List Bullet'] => ul > li:fresh",
      "p[style-name='List Number'] => ol > li:fresh",
    ],
  }

  try {
    // Convert DOCX to HTML
    const result = await mammoth.convertToHtml({ buffer }, options)

    if (result.messages.length > 0) {
      console.warn('Mammoth conversion warnings:', result.messages)
    }

    if (!result.value) {
      throw new Error('No content extracted from document')
    }

    // Configure turndown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
    })

    // Add rules for special cases if needed
    turndownService.addRule('preserve-breaks', {
      filter: 'br',
      replacement: () => '\n',
    })

    // Convert HTML to Markdown
    const markdown = turndownService.turndown(result.value)

    return markdown.trim()
  } catch (error) {
    console.error('Error converting DOCX to Markdown:', error)
    throw new Error('Failed to convert document to Markdown')
  }
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

    const id = uuidv4()
    const filename = file.name
    const title = filename.split('.').slice(0, -1).join('.')
    const fileBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(fileBuffer)

    try {
      let content = ''

      switch (file.type) {
        case 'application/pdf':
          // content = await extractMarkdownFromPDF(buffer)
          //break
          return NextResponse.json({ error: 'PDF not implemented' }, { status: 500 })
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          content = await extractMarkdownFromDOCX(buffer)
          break
        default:
          return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
      }

      await saveDocument({
        id,
        title,
        content,
        userId: user.id,
      })

      return NextResponse.json({ id }, { status: 200 })
    } catch (error) {
      console.error('Processing error:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
  } catch (error) {
    console.error('Request error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
