import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

import { DEFAULT_MODEL_NAME, models } from '@/ai/models'
import { Chat } from '@/components/custom/chat'

export default async function Page() {
  const id = uuidv4()

  const cookieStore = await cookies()
  const modelIdFromCookie = cookieStore.get('model-id')?.value

  const selectedModelId = models.find((model) => model.id === modelIdFromCookie)?.id || DEFAULT_MODEL_NAME

  return (
    <Chat
      key={id}
      id={id}
      initialMessages={[]}
      selectedModelId={selectedModelId}
    />
  )
}
