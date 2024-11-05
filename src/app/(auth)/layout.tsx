export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-center min-h-screen w-full">
      <div className="w-full max-w-xs">{children}</div>
    </main>
  )
}
