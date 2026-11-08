'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import { DomainSettings } from '@/components/domain/DomainSettings'
import {
  PageHeader,
  PageShell,
  cardClass,
} from '@/components/dashboard/ui'
import { cn } from '@/lib/utils'

interface DomainSettingsClientProps {
  instanceId: string
  templateName: string
  currentDomain?: string | null
  subdomain: string
  domainSuffix: string
  backHref: string
}

export function DomainSettingsClient({
  instanceId,
  templateName,
  currentDomain,
  subdomain,
  domainSuffix,
  backHref,
}: DomainSettingsClientProps) {
  const router = useRouter()

  const handleDomainVerified = () => {
    router.refresh()
  }

  return (
    <PageShell className="max-w-5xl">
      <Link
        href={backHref as any}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sites
      </Link>

      <PageHeader
        eyebrow="Site settings"
        title="Domains"
        description={`Connect a custom domain to ${templateName}.`}
      />

      <div className={cn(cardClass, 'p-6')}>
        <DomainSettings
          instanceId={instanceId}
          currentDomain={currentDomain || undefined}
          subdomain={subdomain}
          domainSuffix={domainSuffix}
          onDomainVerified={handleDomainVerified}
        />
      </div>

      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5">
        <div className="flex items-center gap-2 text-sky-900">
          <HelpCircle className="h-4 w-4" />
          <h2 className="text-sm font-semibold">DNS help</h2>
        </div>
        <div className="mt-2 space-y-2 text-sm text-sky-900/80">
          <p>
            Add the TXT record below at your registrar&apos;s DNS management
            page. Common locations:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-xs">
            <li>GoDaddy: My Products → Domain → DNS</li>
            <li>Namecheap: Domain List → Manage → Advanced DNS</li>
            <li>Cloudflare: Domain → DNS</li>
          </ul>
          <p className="text-xs">
            DNS changes can take 5–60 minutes to propagate. If an hour has
            passed, double-check the TXT record value.
          </p>
        </div>
      </div>
    </PageShell>
  )
}
