'use client'

import React, { ChangeEvent, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '../ui/button'
import { PaperclipIcon } from './icons'
import { PreviewAttachment } from './preview-attachment'

export const ProcessDocument = () => {
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([])
  //   const [attachments, setAttachments] = useState<Array<Attachment>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`/api/files/process`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const { id } = data

        return {
          id,
        }
      } else {
        const { error } = await response.json()
        toast.error(error)
      }
    } catch (error) {
      toast.error('Failed to upload file, please try again!')
    }
  }

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    setUploadQueue(files.map((file) => file.name))

    try {
      const uploadPromises = files.map((file) => uploadFile(file))
      const uploadedAttachments = await Promise.all(uploadPromises)
      const successfullyUploadedAttachments = uploadedAttachments.filter((attachment) => attachment !== undefined)

      // setAttachments((currentAttachments) => [...currentAttachments, ...successfullyUploadedAttachments])
    } catch (error) {
      console.error('Error uploading files!', error)
    } finally {
      setUploadQueue([])
    }
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="flex gap-2">
        <PaperclipIcon size={16} />
        Upload Files
      </Button>

      <input
        type="file"
        className="pointer-events-none fixed -left-4 -top-4 size-0.5 opacity-0"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {uploadQueue.length > 0 && (
        <div className="flex flex-row gap-2 overflow-x-scroll">
          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
