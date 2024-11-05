'use client'

import Link from 'next/link'
import { useWindowSize } from 'usehooks-ts'

import { ModelSelector } from '@/components/custom/model-selector'
import { SidebarToggle } from '@/components/custom/sidebar-toggle'
import { Button } from '@/components/ui/button'
import { BetterTooltip } from '@/components/ui/tooltip'

import { useSidebar } from '../ui/sidebar'
import { PlusIcon, VercelIcon } from './icons'

export function ChatHeader({ selectedModelId }: { selectedModelId: string }) {
  const { open } = useSidebar()

  const { width: windowWidth } = useWindowSize()

  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
      <SidebarToggle />
      {(!open || windowWidth < 768) && (
        <BetterTooltip content="New Chat">
          <Button
            variant="outline"
            className="order-2 ml-auto px-2 md:order-1 md:ml-0 md:h-fit md:px-2"
            asChild>
            <Link href="/">
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Link>
          </Button>
        </BetterTooltip>
      )}
      <ModelSelector
        selectedModelId={selectedModelId}
        className="order-1 md:order-2"
      />
    </header>
  )
}
