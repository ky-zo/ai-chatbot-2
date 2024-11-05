import { ComponentProps } from 'react'

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { BetterTooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import { Button } from '../ui/button'
import { SidebarLeftIcon } from './icons'

export function SidebarToggle({ className }: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar()

  return (
    <BetterTooltip
      content="Toggle Sidebar"
      align="start">
      <Button
        onClick={toggleSidebar}
        variant="outline"
        className="md:h-fit md:px-2">
        <SidebarLeftIcon size={16} />
      </Button>
    </BetterTooltip>
  )
}
