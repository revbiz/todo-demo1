import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Todo App MongoDB',
  description: 'A simple todo app built with Next.js and MongoDB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
