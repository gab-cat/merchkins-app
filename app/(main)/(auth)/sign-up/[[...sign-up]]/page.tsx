import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <SignUp appearance={{ variables: { colorPrimary: 'hsl(var(--primary))' } }} />
    </div>
  );
}
