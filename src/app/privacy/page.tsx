import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Privacy Policy</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: January 1, 2026</p>

        <div className="space-y-8 text-sm text-gray-500 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name, email address, and phone number</li>
              <li>Shipping and billing addresses</li>
              <li>Payment information (processed securely through our payment providers)</li>
              <li>Order history and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Provide customer support</li>
              <li>Improve our products and services</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information with trusted third parties who assist us in operating our website, processing payments, and delivering orders.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">5. Cookies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience on our website. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access and update your personal information</li>
              <li>Request deletion of your account</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">7. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at privacy@shophub.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
