import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

import { DEFAULT_MODEL_NAME, models } from '@/ai/models'
import { CanvasChat } from '@/components/custom/canvas-chat'
import { getChatById, getDocumentById, getMessagesByChatId, getUser } from '@/db/queries'
import { convertToUIMessages } from '@/lib/utils'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { id } = params
  const chat = await getChatById({ id })
  const document = await getDocumentById({ id })

  if (!chat || !document) {
    notFound()
  }

  const user = await getUser()

  if (!user) {
    return notFound()
  }

  if (user.id !== chat.userId) {
    return notFound()
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  })

  const cookieStore = await cookies()
  const modelIdFromCookie = cookieStore.get('model-id')?.value
  const selectedModelId = models.find((model) => model.id === modelIdFromCookie)?.id || DEFAULT_MODEL_NAME

  return (
    <CanvasChat
      documentId={chat.id}
      title={document.title || 'Untitled'}
      content={document.content || ''}
      initialMessages={convertToUIMessages(messagesFromDb)}
      selectedModelId={selectedModelId}
    />
  )
}
