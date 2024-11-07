import { deleteDocumentsByIdAfterTimestamp, getDocumentsById, getUser, saveDocument } from '@/db/queries'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return new Response('Missing id', { status: 400 })
  }

  const user = await getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const documents = await getDocumentsById({ id })

  const [document] = documents

  if (!document) {
    return new Response('Not Found', { status: 404 })
  }

  if (document.userId !== user.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  return Response.json(documents, { status: 200 })
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return new Response('Missing id', { status: 400 })
  }

  const user = await getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { content, title }: { content: string; title: string } = await request.json()

  if (user && user.id) {
    const document = await saveDocument({
      id,
      content,
      title,
      userId: user.id,
    })

    return Response.json(document, { status: 200 })
  } else {
    return new Response('Unauthorized', { status: 401 })
  }
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const { timestamp }: { timestamp: string } = await request.json()

  if (!id) {
    return new Response('Missing id', { status: 400 })
  }

  const user = await getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const documents = await getDocumentsById({ id })

  const [document] = documents

  if (document.userId !== user.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  await deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp: new Date(timestamp),
  })

  return new Response('Deleted', { status: 200 })
}