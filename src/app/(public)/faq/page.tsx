import Link from 'next/link'
import { ArrowRight, HelpCircle } from 'lucide-react'
import { PageHeader } from '@/components/public/PageHeader'

export const metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about KOREX templates, plans and accounts.',
}

const groups = [
  {
    title: 'Templates',
    items: [
      {
        question: 'Are the templates fully customizable?',
        answer:
          'Yes. Every template exposes 17+ editable slot types covering layout, typography, colors, gradients, shadows, spacing, animations and more. You can edit everything from the visual editor without writing code.',
      },
      {
        question: 'Do I own the template after purchase?',
        answer:
          'You receive a perpetual license to use the template for one end product. The license includes free updates for as long as the template is available on Korex.',
      },
      {
        question: 'Can I use a template for a client?',
        answer:
          'A Single license covers one end product, including client work. If you build for multiple clients, the Agency plan includes client project licenses and team seats.',
      },
      {
        question: 'Can I see a template before buying?',
        answer:
          'Absolutely. Every template has a live demo you can explore directly from its detail page, rendered with the default content.',
      },
    ],
  },
  {
    title: 'Accounts & Billing',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Click Get Started and choose Customer or Contributor. You can sign up with an email address and password in under a minute.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We process payments securely through Midtrans, supporting cards, bank transfer, e-wallets and other local payment methods.',
      },
      {
        question: 'Can I cancel my All-Access plan?',
        answer:
          'Yes, you can cancel anytime from your dashboard. You keep access until the end of the current billing period.',
      },
      {
        question: 'Do you offer refunds?',
        answer:
          'Because templates are delivered instantly, refunds are available within 14 days if a template does not work as described.',
      },
    ],
  },
  {
    title: 'Domains & Publishing',
    items: [
      {
        question: 'Can I connect my own domain?',
        answer:
          'Yes. Korex supports custom domains with guided DNS setup, automatic verification and SSL. Free subdomains are included on every template.',
      },
      {
        question: 'How long does publishing take?',
        answer:
          'Once your content is ready, publishing is instant. DNS propagation for custom domains typically completes within a few minutes to a few hours.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Help center"
        title={
          <>
            Frequently asked
            <span className="text-gradient-fire"> questions</span>
          </>
        }
        description="Everything you need to know about buying, customizing and publishing with Korex."
      />

      <section className="korex-section py-16">
        <div className="mx-auto max-w-3xl space-y-12">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="korex-h3">{group.title}</h2>
              <div className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-orange-300 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-base font-semibold text-slate-900">
                      {item.question}
                      <span className="text-orange-600 transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-orange-200 bg-orange-50/60 p-8 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-100 text-orange-600">
                <HelpCircle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Still have a question?
                </h3>
                <p className="text-sm text-slate-600">
                  Our team is happy to help you out.
                </p>
              </div>
            </div>
            <Link href="/contact" className="korex-btn-primary shrink-0">
              Contact support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
