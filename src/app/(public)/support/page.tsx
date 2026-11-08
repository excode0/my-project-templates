import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CreditCard,
  Globe,
  LifeBuoy,
  Mail,
  MessageSquare,
  Palette,
  Server,
} from 'lucide-react'
import { PageHeader } from '@/components/public/PageHeader'

export const metadata = {
  title: 'Support',
  description: 'Get help with your KOREX account, templates, billing and domains.',
}

const channels = [
  {
    Icon: Mail,
    title: 'Email support',
    description: 'Reach our team at hello@korex.com — we reply within one business day.',
    action: 'Email us',
    href: 'mailto:hello@korex.com',
    external: true,
  },
  {
    Icon: MessageSquare,
    title: 'Live chat',
    description: 'Chat with us Monday to Friday, 9am – 6pm WIB for quick questions.',
    action: 'Start a chat',
    href: '/contact',
    external: false,
  },
  {
    Icon: LifeBuoy,
    title: 'Help center',
    description: 'Browse guides and answers to the most common questions.',
    action: 'Visit FAQ',
    href: '/faq',
    external: false,
  },
]

const topics = [
  {
    Icon: Palette,
    title: 'Using the editor',
    description: 'Learn how to customize every slot and publish your changes.',
    href: '/faq',
  },
  {
    Icon: CreditCard,
    title: 'Billing & payments',
    description: 'Invoices, payment methods, refunds and subscription changes.',
    href: '/faq',
  },
  {
    Icon: Globe,
    title: 'Domains & SSL',
    description: 'Connect a custom domain and verify your DNS settings.',
    href: '/faq',
  },
  {
    Icon: Server,
    title: 'Publishing & hosting',
    description: 'Everything about going live, uptime and performance.',
    href: '/faq',
  },
] as const

export default function SupportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Support"
        title={
          <>
            How can we
            <span className="text-gradient-fire"> help you?</span>
          </>
        }
        description="Find answers fast, or reach out to our team. We are here for you every step of the way."
      />

      <section className="korex-section py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {channels.map(({ Icon, title, description, action, href, external }) => (
            <div
              key={title}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-orange-600">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="korex-h3 mt-5">{title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
              {external ? (
                <a
                  href={href}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  {action}
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  href={href as '/contact' | '/faq'}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  {action}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="korex-section">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-orange-600" />
            <h2 className="korex-h2">Popular topics</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {topics.map(({ Icon, title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-orange-600">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="korex-section py-20">
        <div className="relative overflow-hidden rounded-3xl border border-orange-200 bg-orange-50/60 px-8 py-14 text-center">
          <div className="pointer-events-none absolute inset-0 bg-radial-fire" />
          <div className="relative mx-auto max-w-xl">
            <h2 className="korex-h2">All systems operational</h2>
            <p className="mt-3 text-slate-600">
              Korex runs on reliable, monitored infrastructure. If something looks off, let us
              know right away.
            </p>
            <Link href="/contact" className="korex-btn-primary mt-6">
              Report an issue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
