import { auth } from '@/lib/auth'
import { SiteHeader } from '@/components/public/SiteHeader'
import { SiteFooter } from '@/components/public/SiteFooter'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-white">
      <SiteHeader user={session?.user ?? null} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
