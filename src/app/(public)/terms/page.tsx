import { LegalPage, LegalSection } from '@/components/public/LegalPage'

export const metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of KOREX.',
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 2026">
      <LegalSection title="1. Acceptance of terms">
        <p>
          By accessing or using KOREX (&ldquo;the Platform&rdquo;), you agree to be bound by
          these Terms of Service. If you do not agree, please do not use the Platform.
        </p>
      </LegalSection>

      <LegalSection title="2. Accounts">
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activity that occurs under your account. You must provide accurate information
          and be at least 18 years old to make purchases.
        </p>
      </LegalSection>

      <LegalSection title="3. Templates and licenses">
        <p>
          Purchasing a template grants you a non-exclusive, perpetual license to use that
          template for a single end product. You may customize the template fully. You may not
          resell, redistribute or sublicense the template itself, whether modified or unmodified.
        </p>
        <p>
          Agency plans grant additional client project licenses as described on the pricing page.
        </p>
      </LegalSection>

      <LegalSection title="4. Contributor content">
        <p>
          Contributors retain ownership of the templates they create and grant KOREX a license to
          display, market and distribute those templates on the Platform. Contributors receive
          70% of each sale, subject to the payout schedule in their dashboard.
        </p>
      </LegalSection>

      <LegalSection title="5. Payments and refunds">
        <p>
          Payments are processed by third-party providers. Digital templates are delivered
          instantly, so refunds are offered within 14 days only where a template does not work as
          described. Subscription plans can be cancelled at any time.
        </p>
      </LegalSection>

      <LegalSection title="6. Acceptable use">
        <p>
          You agree not to use the Platform for unlawful purposes, to infringe the rights of
          others, to distribute malware, or to attempt to disrupt or reverse engineer the
          Platform.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitation of liability">
        <p>
          The Platform is provided &ldquo;as is&rdquo; without warranties of any kind. To the
          maximum extent permitted by law, KOREX is not liable for indirect, incidental or
          consequential damages arising from your use of the Platform.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          Questions about these terms? Email us at{' '}
          <a href="mailto:legal@korex.com" className="font-medium text-orange-600 hover:underline">
            legal@korex.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
