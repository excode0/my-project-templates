import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BrandProps {
  href?: React.ComponentProps<typeof Link>['href']
  className?: string
  showWordmark?: boolean
}

export function Brand({ href = '/', className, showWordmark = true }: BrandProps) {
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-3', className)}>
      <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-50 to-orange-100 shadow-md ring-1 ring-orange-200 transition-transform duration-300 group-hover:scale-105">
        <Image
          src="/logo1.png"
          alt="KOREX"
          width={40}
          height={40}
          className="h-9 w-9 object-contain"
          priority
        />
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-xl font-semibold tracking-wide text-slate-900">
            KOREX
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.32em] text-slate-600">
            Templates
          </span>
        </span>
      )}
    </Link>
  )
}
