'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWindowSize } from 'usehooks-ts'

import { UISuggestion } from '@/lib/editor/suggestions'

import { Button } from '../ui/button'
import { CrossIcon, MessageIcon } from './icons'

export const Suggestion = ({ suggestion, onApply }: { suggestion: UISuggestion; onApply: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { width: windowWidth } = useWindowSize()

  return (
    <AnimatePresence>
      {!isExpanded ? (
        <motion.div
          className="absolute -right-8 cursor-pointer p-1 text-muted-foreground"
          onClick={() => {
            setIsExpanded(true)
          }}
          whileHover={{ scale: 1.1 }}>
          <MessageIcon size={windowWidth && windowWidth < 768 ? 16 : 14} />
        </motion.div>
      ) : (
        <motion.div
          key={suggestion.id}
          className="absolute -right-12 z-50 flex w-56 flex-col gap-3 rounded-2xl border bg-background p-3 text-sm shadow-xl md:-right-16"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: -20 }}
          exit={{ opacity: 0, y: -10 }}
          whileHover={{ scale: 1.05 }}>
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <div className="size-4 rounded-full bg-muted-foreground/25" />
              <div className="font-medium">Assistant</div>
            </div>
            <div
              className="cursor-pointer text-xs text-gray-500"
              onClick={() => {
                setIsExpanded(false)
              }}>
              <CrossIcon size={12} />
            </div>
          </div>
          <div>{suggestion.description}</div>
          <Button
            variant="outline"
            className="w-fit rounded-full px-3 py-1.5"
            onClick={onApply}>
            Apply
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
