'use client'

import { type ComponentProps } from 'react'
import { useFormStatus } from 'react-dom'

import { Button } from './button'

type Props = ComponentProps<typeof Button> & {
  pendingText?: string
}

export function SubmitButton({ children, pendingText = 'Submitting...', ...props }: Props) {
  const { pending } = useFormStatus()
  // const pending = true

  return (
    <Button
      type="submit"
      aria-disabled={pending}
      // loading={pending}
      {...props}>
      {pending ? pendingText : children}
    </Button>
  )
}
