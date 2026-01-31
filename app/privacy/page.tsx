export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-6">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last Updated: January 31, 2026</p>
        
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              Welcome to Byte Runner. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our educational cybersecurity game.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-cyan-300 mb-3">2.1 Local Storage Data</h3>
            <p className="leading-relaxed mb-4">
              We store minimal data locally in your browser using localStorage:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>High Score:</strong> Your highest game score to track your personal best</li>
              <li><strong>Tutorial Status:</strong> Whether you've seen the tutorial (to avoid showing it repeatedly)</li>
            </ul>
            <p className="leading-relaxed mt-4">
              This data is stored only on your device and is never transmitted to our servers.
            </p>

            <h3 className="text-xl font-semibold text-cyan-300 mb-3 mt-6">2.2 Analytics Data</h3>
            <p className="leading-relaxed mb-4">
              We use Google Analytics 4 to understand how users interact with our game. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Page views and session duration</li>
              <li>Game events (starts, completions, levels reached)</li>
              <li>Device type and browser information</li>
              <li>General geographic location (country/city level)</li>
            </ul>
            <p className="leading-relaxed mt-4">
              No personally identifiable information (PII) is collected through analytics.
            </p>

            <h3 className="text-xl font-semibold text-cyan-300 mb-3 mt-6">2.3 Error Tracking</h3>
            <p className="leading-relaxed">
              We use Sentry for error monitoring to improve game stability. This may include browser type, error messages, and anonymized session data. No personal information is included in error reports.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">3. What We Don't Collect</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We do not collect names, email addresses, or any personal identification</li>
              <li>We do not use cookies for tracking</li>
              <li>We do not collect payment information (the game is free)</li>
              <li>We do not sell or share your data with third parties</li>
              <li>We do not create user accounts or profiles</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">4. How We Use Information</h2>
            <p className="leading-relaxed mb-4">
              The limited data we collect is used solely to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Improve game performance and fix bugs</li>
              <li>Understand how users interact with the game</li>
              <li>Make informed decisions about new features</li>
              <li>Ensure the game works across different devices and browsers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">5. Third-Party Services</h2>
            <p className="leading-relaxed mb-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Google Analytics 4:</strong> Web analytics service (subject to Google's Privacy Policy)</li>
              <li><strong>Sentry:</strong> Error tracking service (subject to Sentry's Privacy Policy)</li>
              <li><strong>Vercel:</strong> Hosting provider (subject to Vercel's Privacy Policy)</li>
            </ul>
            <p className="leading-relaxed mt-4">
              These services have their own privacy policies and may collect data independently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">6. Your Rights</h2>
            <p className="leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Clear your localStorage data at any time through your browser settings</li>
              <li>Opt out of analytics by using browser extensions like uBlock Origin</li>
              <li>Request information about what data we've collected (though we collect almost nothing)</li>
              <li>Request deletion of any data (you can clear localStorage yourself)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">7. Children's Privacy</h2>
            <p className="leading-relaxed">
              Byte Runner is designed to be educational and safe for all ages. We do not knowingly collect any personal information from children under 13. Since we don't collect personal data at all, the game can be used by anyone.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">8. International Users</h2>
            <p className="leading-relaxed">
              Byte Runner is hosted on servers that may be located in various countries. By using the game, you consent to the transfer of information to countries outside your residence, which may have different data protection rules.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">9. Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of Byte Runner after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">10. Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:connect@knacksters.co" className="text-cyan-400 hover:text-cyan-300 underline">
                connect@knacksters.co
              </a>
            </p>
          </section>

          <section className="border-t border-cyan-800 pt-6">
            <p className="text-sm text-gray-500 italic">
              Summary: We collect almost no data. Your high score is saved locally on your device. We use analytics to improve the game. No personal information is collected or sold.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
