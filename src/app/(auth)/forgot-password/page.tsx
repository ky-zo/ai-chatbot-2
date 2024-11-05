import Link from 'next/link'

import { forgotPasswordAction } from '@/actions/auth'
import { AuthMessage, FormMessage } from '@/components/ui/form-message'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/ui/submit-button'

import { SmtpMessage } from '../smtp-message'

type SearchParams = Promise<{ message: AuthMessage }>

export default async function ForgotPassword(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const message = searchParams.message as AuthMessage

  return (
    <div>
      <form className="mx-auto flex w-full min-w-64 max-w-64 flex-1 flex-col gap-2 text-foreground [&>input]:mb-6">
        <div>
          <h1 className="text-2xl font-medium">Reset Password</h1>
          <p className="text-sm text-secondary-foreground">
            Already have an account?{' '}
            <Link
              className="text-primary underline"
              href="/login">
              Sign in
            </Link>
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-2 [&>input]:mb-3">
          <Label htmlFor="email">Email</Label>
          <Input
            name="email"
            placeholder="you@example.com"
            required
          />
          <SubmitButton formAction={forgotPasswordAction}>Reset Password</SubmitButton>
          <FormMessage message={message} />
        </div>
      </form>
      <SmtpMessage />
    </div>
  )
}
