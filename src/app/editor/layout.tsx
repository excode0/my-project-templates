import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Visual editor',
  robots: {
    index: false,
    follow: false,
  },
}

export default function EditorRootLayout({
  children,
}: {
  children: ReactNode
}) {
  return <div className="min-h-screen bg-[#0F1117]">{children}</div>
}
