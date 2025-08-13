import { SignIn } from '@clerk/nextjs'

export default function Page () {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <SignIn appearance={{ variables: { colorPrimary: 'hsl(var(--primary))' } }} />
    </div>
  )
}