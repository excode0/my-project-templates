'use client'

import Link from 'next/link'
import { ArrowUpRight, Github, Instagram, Linkedin, Twitter } from 'lucide-react'
import { Brand } from './Brand'

const columns = [
  {
    title: 'Product',
    links: [
      { href: '/marketplace', label: 'Templates' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/demo/portfolio-creative', label: 'Live Demo' },
      { href: '/dashboard', label: 'Dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Korex' },
      { href: '/contact', label: 'Contact' },
      { href: '/support', label: 'Support' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
    ],
  },
] as const

const socials = [
  { href: 'https://twitter.com/korex_studio', label: 'Twitter', Icon: Twitter },
  { href: 'https://instagram.com/korex_studio', label: 'Instagram', Icon: Instagram },
  { href: 'https://linkedin.com/company/korex', label: 'LinkedIn', Icon: Linkedin },
  { href: 'https://github.com/korex', label: 'GitHub', Icon: Github },
]

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-slate-200 bg-slate-50">
      <div className="korex-section py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Brand />
            <p className="mt-5 text-sm leading-relaxed text-slate-600">
              Premium, fully customizable website templates with a powerful visual
              editor. Launch a beautiful site in minutes — no code required.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-900">
                {column.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-slate-600 transition-colors hover:text-orange-600"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} KOREX. All rights reserved.
          </p>
          <p className="text-sm text-slate-600">
            Crafted with <span className="text-orange-500">fire</span> for ambitious builders.
          </p>
        </div>
      </div>
    </footer>
  )
}
