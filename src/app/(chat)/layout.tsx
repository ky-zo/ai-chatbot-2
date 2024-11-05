import { cookies } from 'next/headers'

import { AppSidebar } from '@/components/custom/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getUser } from '@/db/queries'

export const experimental_ppr = true

export default async function Layout({ children }: { children: React.ReactNode }) {
  const [user, cookieStore] = await Promise.all([getUser(), cookies()])
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true'

  if (!user) return null

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <AppSidebar user={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
