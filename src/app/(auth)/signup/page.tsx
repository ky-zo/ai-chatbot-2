import Link from 'next/link'

import { signUpAction } from '@/actions/auth'
import { AuthMessage, FormMessage } from '@/components/ui/form-message'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/ui/submit-button'

type SearchParams = Promise<{ message: AuthMessage }>

export default async function Signup(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const message = searchParams.message as AuthMessage

  if ('message' in searchParams) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center gap-2 p-4 sm:max-w-md">
        <FormMessage message={message} />
      </div>
    )
  }

  return (
    <form className="flex w-full flex-col">
      <h1 className="text-2xl font-medium">Sign up</h1>
      <p className="text text-sm text-foreground">
        Already have an account?{' '}
        <Link
          className="font-medium text-primary underline"
          href="/login">
          Sign in
        </Link>
      </p>
      <div className="mt-8 flex flex-col gap-2 [&>input]:mb-3">
        <Label htmlFor="email">Email</Label>
        <Input
          name="email"
          placeholder="you@example.com"
          required
        />
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          minLength={6}
          required
        />
        <SubmitButton
          formAction={signUpAction}
          pendingText="Signing up...">
          Sign up
        </SubmitButton>
        <FormMessage message={message} />
      </div>
    </form>
  )
}
