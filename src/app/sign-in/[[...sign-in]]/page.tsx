import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="h-[100dvh] w-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="animate-fade-in">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-[var(--bg-elevated)] shadow-lg rounded-[var(--radius-xl)]',
            },
          }}
        />
      </div>
    </div>
  )
}
