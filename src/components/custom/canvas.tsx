import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { Attachment, ChatRequestOptions, CreateMessage, Message } from 'ai'
import cx from 'classnames'
import { formatDistance } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import useSWR, { useSWRConfig } from 'swr'
import { useCopyToClipboard, useDebounceCallback, useWindowSize } from 'usehooks-ts'

import { Document, Suggestion, Vote } from '@/db/schema'
import { fetcher } from '@/lib/utils'

import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { DiffView } from './diffview'
import { DocumentSkeleton } from './document-skeleton'
import { Editor } from './editor'
import { CopyIcon, CrossIcon, DeltaIcon, RedoIcon, UndoIcon } from './icons'
import { PreviewMessage } from './message'
import { MultimodalInput } from './multimodal-input'
import { Toolbar } from './toolbar'
import { useScrollToBottom } from './use-scroll-to-bottom'
import { VersionFooter } from './version-footer'

export interface UICanvas {
  title: string
  documentId: string
  content: string
  isVisible: boolean
  status: 'streaming' | 'idle'
  boundingBox: {
    top: number
    left: number
    width: number
    height: number
  }
}

export function Canvas({
  chatId,
  input,
  setInput,
  handleSubmit,
  isLoading,
  stop,
  attachments,
  setAttachments,
  append,
  canvas,
  setCanvas,
  messages,
  setMessages,
  votes,
}: {
  chatId: string
  input: string
  setInput: (input: string) => void
  isLoading: boolean
  stop: () => void
  attachments: Array<Attachment>
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>
  canvas: UICanvas
  setCanvas: Dispatch<SetStateAction<UICanvas>>
  messages: Array<Message>
  setMessages: Dispatch<SetStateAction<Array<Message>>>
  votes: Array<Vote> | undefined
  append: (message: Message | CreateMessage, chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>
  handleSubmit: (
    event?: {
      preventDefault?: () => void
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void
}) {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>()

  const {
    data: documents,
    isLoading: isDocumentsFetching,
    mutate: mutateDocuments,
  } = useSWR<Array<Document>>(canvas && canvas.status !== 'streaming' ? `/api/document?id=${canvas.documentId}` : null, fetcher)

  const { data: suggestions } = useSWR<Array<Suggestion>>(
    documents && canvas && canvas.status !== 'streaming' ? `/api/suggestions?documentId=${canvas.documentId}` : null,
    fetcher,
    {
      dedupingInterval: 5000,
    }
  )

  const [mode, setMode] = useState<'edit' | 'diff'>('edit')
  const [document, setDocument] = useState<Document | null>(null)
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1)

  useEffect(() => {
    if (documents && documents.length > 0) {
      const mostRecentDocument = documents.at(-1)

      if (mostRecentDocument) {
        setDocument(mostRecentDocument)
        setCurrentVersionIndex(documents.length - 1)
        setCanvas((currentCanvas) => ({
          ...currentCanvas,
          content: mostRecentDocument.content ?? '',
        }))
      }
    }
  }, [documents, setCanvas])

  useEffect(() => {
    mutateDocuments()
  }, [canvas.status, mutateDocuments])

  const { mutate } = useSWRConfig()
  const [isContentDirty, setIsContentDirty] = useState(false)

  const handleContentChange = useCallback(
    (updatedContent: string) => {
      if (!canvas) return

      mutate<Array<Document>>(
        `/api/document?id=${canvas.documentId}`,
        async (currentDocuments) => {
          if (!currentDocuments) return undefined

          const currentDocument = currentDocuments.at(-1)

          if (!currentDocument || !currentDocument.content) {
            setIsContentDirty(false)
            return currentDocuments
          }

          if (currentDocument.content !== updatedContent) {
            await fetch(`/api/document?id=${canvas.documentId}`, {
              method: 'POST',
              body: JSON.stringify({
                title: canvas.title,
                content: updatedContent,
              }),
            })

            setIsContentDirty(false)

            const newDocument = {
              ...currentDocument,
              content: updatedContent,
              createdAt: new Date(),
            }

            return [...currentDocuments, newDocument]
          } else {
            return currentDocuments
          }
        },
        { revalidate: false }
      )
    },
    [canvas, mutate]
  )

  const debouncedHandleContentChange = useDebounceCallback(handleContentChange, 2000)

  const saveContent = useCallback(
    (updatedContent: string, debounce: boolean) => {
      if (document && updatedContent !== document.content) {
        setIsContentDirty(true)

        if (debounce) {
          debouncedHandleContentChange(updatedContent)
        } else {
          handleContentChange(updatedContent)
        }
      }
    },
    [document, debouncedHandleContentChange, handleContentChange]
  )

  function getDocumentContentById(index: number) {
    if (!documents) return ''
    if (!documents[index]) return ''
    return documents[index].content ?? ''
  }

  const handleVersionChange = (type: 'next' | 'prev' | 'toggle' | 'latest') => {
    if (!documents) return

    if (type === 'latest') {
      setCurrentVersionIndex(documents.length - 1)
      setMode('edit')
    }

    if (type === 'toggle') {
      setMode((mode) => (mode === 'edit' ? 'diff' : 'edit'))
    }

    if (type === 'prev') {
      if (currentVersionIndex > 0) {
        setCurrentVersionIndex((index) => index - 1)
      }
    } else if (type === 'next') {
      if (currentVersionIndex < documents.length - 1) {
        setCurrentVersionIndex((index) => index + 1)
      }
    }
  }

  const [isToolbarVisible, setIsToolbarVisible] = useState(false)

  /*
   * NOTE: if there are no documents, or if
   * the documents are being fetched, then
   * we mark it as the current version.
   */

  const isCurrentVersion = documents && documents.length > 0 ? currentVersionIndex === documents.length - 1 : true

  const { width: windowWidth, height: windowHeight } = useWindowSize()
  const isMobile = windowWidth ? windowWidth < 768 : false

  const [_, copyToClipboard] = useCopyToClipboard()

  return (
    <motion.div
      className="fixed left-0 top-0 z-50 flex h-dvh w-dvw flex-row bg-muted"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { delay: 0.4 } }}>
      {!isMobile && (
        <motion.div
          className="relative h-dvh w-[400px] shrink-0 bg-muted dark:bg-background"
          initial={{ opacity: 0, x: windowWidth - 420, scale: 1 }}
          animate={{
            opacity: 1,
            x: windowWidth - 400,
            scale: 1,
            transition: {
              delay: 0.2,
              type: 'spring',
              stiffness: 200,
              damping: 30,
            },
          }}
          exit={{
            opacity: 0,
            x: windowWidth - 420,
            scale: 0.95,
            transition: { delay: 0 },
          }}>
          <AnimatePresence>
            {!isCurrentVersion && (
              <motion.div
                className="absolute left-0 top-0 z-50 h-dvh w-[400px] bg-zinc-900/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          <div className="flex h-full flex-col items-center justify-between gap-4">
            <div
              ref={messagesContainerRef}
              className="flex h-full flex-col items-center gap-4 overflow-y-scroll px-4 pt-20">
              {messages.map((message, index) => (
                <PreviewMessage
                  chatId={chatId}
                  key={message.id}
                  message={message}
                  canvas={canvas}
                  setCanvas={setCanvas}
                  isLoading={isLoading && index === messages.length - 1}
                  vote={votes ? votes.find((vote) => vote.messageId === message.id) : undefined}
                />
              ))}

              <div
                ref={messagesEndRef}
                className="min-h-[24px] min-w-[24px] shrink-0"
              />
            </div>

            <form className="relative flex w-full flex-row items-end gap-2 px-4 pb-4">
              <MultimodalInput
                chatId={chatId}
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                stop={stop}
                attachments={attachments}
                setAttachments={setAttachments}
                messages={messages}
                append={append}
                className="bg-background dark:bg-muted"
                setMessages={setMessages}
              />
            </form>
          </div>
        </motion.div>
      )}

      <motion.div
        className="fixed flex h-dvh flex-col overflow-y-scroll bg-background shadow-xl dark:bg-muted"
        initial={
          isMobile
            ? {
                opacity: 0,
                x: 0,
                y: 0,
                width: windowWidth,
                height: windowHeight,
                borderRadius: 50,
              }
            : {
                opacity: 0,
                x: canvas.boundingBox.left,
                y: canvas.boundingBox.top,
                height: canvas.boundingBox.height,
                width: canvas.boundingBox.width,
                borderRadius: 50,
              }
        }
        animate={
          isMobile
            ? {
                opacity: 1,
                x: 0,
                y: 0,
                width: windowWidth,
                height: '100dvh',
                borderRadius: 0,
                transition: {
                  delay: 0,
                  type: 'spring',
                  stiffness: 200,
                  damping: 30,
                },
              }
            : {
                opacity: 1,
                x: 0,
                y: 0,
                height: windowHeight,
                width: windowWidth ? windowWidth - 400 : 'calc(100dvw-400px)',
                borderRadius: 0,
                transition: {
                  delay: 0,
                  type: 'spring',
                  stiffness: 200,
                  damping: 30,
                },
              }
        }
        exit={{
          opacity: 0,
          scale: 0.5,
          transition: {
            delay: 0.1,
            type: 'spring',
            stiffness: 600,
            damping: 30,
          },
        }}>
        <div className="flex flex-row items-start justify-between p-2">
          <div className="flex flex-row items-start gap-4">
            <div
              className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-muted dark:hover:bg-zinc-700"
              onClick={() => {
                setCanvas((currentCanvas) => ({
                  ...currentCanvas,
                  isVisible: false,
                }))
              }}>
              <CrossIcon size={18} />
            </div>

            <div className="flex flex-col pt-1">
              <div className="font-medium">{document?.title ?? canvas.title}</div>

              {isContentDirty ? (
                <div className="text-sm text-muted-foreground">Saving changes...</div>
              ) : document ? (
                <div className="text-sm text-muted-foreground">
                  {`Updated ${formatDistance(new Date(document.createdAt), new Date(), {
                    addSuffix: true,
                  })}`}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-row gap-1">
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-muted dark:hover:bg-zinc-700"
                  onClick={() => {
                    copyToClipboard(canvas.content)
                    toast.success('Copied to clipboard!')
                  }}>
                  <CopyIcon size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>Copy to clipboard</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-muted dark:hover:bg-zinc-700"
                  onClick={() => {
                    handleVersionChange('prev')
                  }}>
                  <UndoIcon size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>View Previous version</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-muted dark:hover:bg-zinc-700"
                  onClick={() => {
                    handleVersionChange('next')
                  }}>
                  <RedoIcon size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>View Next version</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={cx('cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-muted dark:hover:bg-zinc-700', {
                    'bg-muted dark:bg-zinc-700': mode === 'diff',
                  })}
                  onClick={() => {
                    handleVersionChange('toggle')
                  }}>
                  <DeltaIcon size={18} />
                </div>
              </TooltipTrigger>
              <TooltipContent>View changes</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="prose h-full !max-w-full items-center overflow-y-scroll bg-background px-4 py-8 pb-40 dark:prose-invert dark:bg-muted md:p-20">
          <div className="mx-auto flex max-w-[600px] flex-row">
            {isDocumentsFetching && !canvas.content ? (
              <DocumentSkeleton />
            ) : mode === 'edit' ? (
              <Editor
                content={isCurrentVersion ? canvas.content : getDocumentContentById(currentVersionIndex)}
                isCurrentVersion={isCurrentVersion}
                currentVersionIndex={currentVersionIndex}
                status={canvas.status}
                saveContent={saveContent}
                suggestions={isCurrentVersion ? (suggestions ?? []) : []}
              />
            ) : (
              <DiffView
                oldContent={getDocumentContentById(currentVersionIndex - 1)}
                newContent={getDocumentContentById(currentVersionIndex)}
              />
            )}

            {suggestions ? <div className="h-dvh w-12 shrink-0 md:hidden" /> : null}

            <AnimatePresence>
              {isCurrentVersion && (
                <Toolbar
                  isToolbarVisible={isToolbarVisible}
                  setIsToolbarVisible={setIsToolbarVisible}
                  append={append}
                  isLoading={isLoading}
                  stop={stop}
                  setMessages={setMessages}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {!isCurrentVersion && (
            <VersionFooter
              canvas={canvas}
              currentVersionIndex={currentVersionIndex}
              documents={documents}
              handleVersionChange={handleVersionChange}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
