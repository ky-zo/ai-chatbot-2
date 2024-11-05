import { Metadata } from 'next'
import { Toaster } from 'sonner'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://chat.vercel.ai'),
  title: 'Next.js Chatbot Template',
  description: 'Next.js chatbot template using the AI SDK.',
}

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
