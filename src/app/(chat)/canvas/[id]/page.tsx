import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

import { DEFAULT_MODEL_NAME, models } from '@/ai/models'
import { Chat as PreviewChat } from '@/components/custom/chat'
import { getChatById, getMessagesByChatId, getUser } from '@/db/queries'
import { convertToUIMessages } from '@/lib/utils'

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const { id } = params
  const chat = await getChatById({ id })

  if (!chat) {
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
    <PreviewChat
      id={chat.id}
      initialMessages={convertToUIMessages(messagesFromDb)}
      selectedModelId={selectedModelId}
    />
  )
}
