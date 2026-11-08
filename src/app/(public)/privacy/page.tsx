import { LegalPage, LegalSection } from '@/components/public/LegalPage'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How KOREX collects, uses and protects your data.',
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 2026">
      <LegalSection title="1. Information we collect">
        <p>
          We collect information you provide directly, such as your name, email address and
          password when you create an account, and payment details processed by our payment
          providers. We also collect usage data such as pages visited and actions taken.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use information">
        <p>
          We use your information to provide and improve the Platform, process transactions,
          communicate with you, and keep the Platform secure. We do not sell your personal data.
        </p>
      </LegalSection>

      <LegalSection title="3. Cookies">
        <p>
          We use essential cookies to keep you signed in and to remember preferences. You can
          control cookies through your browser settings, though some features may not work without
          them.
        </p>
      </LegalSection>

      <LegalSection title="4. Sharing and disclosure">
        <p>
          We share data only with service providers that help us operate the Platform, such as
          payment processors and hosting providers, and where required by law.
        </p>
      </LegalSection>

      <LegalSection title="5. Data retention and security">
        <p>
          We retain your data for as long as your account is active or as needed to provide the
          Platform. We use industry-standard measures to protect your data, but no method of
          transmission or storage is completely secure.
        </p>
      </LegalSection>

      <LegalSection title="6. Your rights">
        <p>
          You may access, update or delete your personal information from your account, or by
          contacting us. Depending on your location, you may have additional rights under
          applicable data protection laws.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          For privacy questions, email{' '}
          <a href="mailto:privacy@korex.com" className="font-medium text-orange-600 hover:underline">
            privacy@korex.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
