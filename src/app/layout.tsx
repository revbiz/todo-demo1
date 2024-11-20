import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Todo App SQLite',
  description: 'A simple todo app built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
