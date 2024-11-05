import Link from 'next/link'

import { signInAction } from '@/actions/auth'
import { AuthMessage, FormMessage } from '@/components/ui/form-message'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/ui/submit-button'

import LocalhostAuthButton from '../localhost-access-button'

type SearchParams = Promise<{ message: AuthMessage }>

export default async function Login(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams
  const message = searchParams.message as AuthMessage

  return (
    <form className="flex w-full flex-col">
      <h1 className="text-2xl font-medium">Sign in</h1>
      <p className="text-sm text-foreground">
        Don&apos;t have an account?{' '}
        <Link
          className="font-medium text-foreground underline"
          href="/signup">
          Sign up
        </Link>
      </p>
      <div className="mt-8 flex flex-col gap-2 [&>input]:mb-3">
        <Label htmlFor="email">Email</Label>
        <Input
          name="email"
          placeholder="you@example.com"
          required
        />
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password">
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
        <SubmitButton
          pendingText="Signing In..."
          formAction={signInAction}>
          Sign in
        </SubmitButton>
        <FormMessage message={message} />
        <LocalhostAuthButton />
      </div>
    </form>
  )
}
