import { getChatsByUserId, getUser } from '@/db/queries'

export async function GET() {
  const user = await getUser()

  if (!user) {
    return Response.json('Unauthorized!', { status: 401 })
  }

  const chats = await getChatsByUserId({ id: user.id! })
  return Response.json(chats)
}
