'use client'

import { useState } from 'react'
import { Attachment, Message } from 'ai'
import { useChat } from 'ai/react'
import { AnimatePresence } from 'framer-motion'
import useSWR, { useSWRConfig } from 'swr'
import { useWindowSize } from 'usehooks-ts'

import { ChatHeader } from '@/components/custom/chat-header'
import { PreviewMessage } from '@/components/custom/message'
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom'
import { Vote } from '@/db/schema'
import { fetcher } from '@/lib/utils'

import { Canvas, UICanvas } from './canvas'
import { CanvasStreamHandler } from './canvas-stream-handler'
import { MultimodalInput } from './multimodal-input'
import { Overview } from './overview'

export function CanvasChat({
  documentId,
  title,
  content,
  initialMessages,
  selectedModelId,
}: {
  documentId: string
  title: string
  content: string
  initialMessages: Array<Message>
  selectedModelId: string
}) {
  const { mutate } = useSWRConfig()

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    data: streamingData,
  } = useChat({
    body: { documentId, modelId: selectedModelId },
    initialMessages,
    onFinish: () => {
      mutate('/api/history')
    },
  })

  const { width: windowWidth = 1920, height: windowHeight = 1080 } = useWindowSize()

  const [canvas, setCanvas] = useState<UICanvas>({
    documentId: documentId,
    content: content,
    title: title,
    status: 'idle',
    isVisible: true,
    boundingBox: {
      top: windowHeight / 4,
      left: windowWidth / 4,
      width: 250,
      height: 50,
    },
  })

  const { data: votes } = useSWR<Array<Vote>>(`/api/vote?chatId=${documentId}`, fetcher)

  const [attachments, setAttachments] = useState<Array<Attachment>>([])

  return (
    <>
      {canvas && canvas.isVisible && (
        <Canvas
          chatId={documentId}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          append={append}
          canvas={canvas}
          setCanvas={setCanvas}
          messages={messages}
          setMessages={setMessages}
          votes={votes}
        />
      )}

      <CanvasStreamHandler
        streamingData={streamingData}
        setCanvas={setCanvas}
      />
    </>
  )
}
