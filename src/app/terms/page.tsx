import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Terms of Service</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: January 1, 2026</p>

        <div className="space-y-8 text-sm text-gray-500 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ShopHub's website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">2. Account Registration</h2>
            <p>
              To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">3. Products and Pricing</h2>
            <p className="mb-3">
              We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions or pricing is always accurate, complete, or current.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prices are subject to change without notice</li>
              <li>We reserve the right to limit order quantities</li>
              <li>Product images are for illustration purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">4. Orders and Payment</h2>
            <p className="mb-3">
              By placing an order, you are making an offer to purchase products. We may accept or decline any order for any reason.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>All payments must be received before order processing</li>
              <li>We accept major credit cards, PayPal, and cash on delivery</li>
              <li>Orders may be subject to fraud screening</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">5. Shipping and Delivery</h2>
            <p>
              We will make every effort to deliver your order within the estimated timeframe. However, delivery times are estimates and may vary due to factors beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">6. Returns and Refunds</h2>
            <p>
              Returns and refunds are subject to our Return Policy. Please refer to our Returns & Exchanges page for details.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
            <p>
              All content on this website, including text, graphics, logos, and images, is the property of ShopHub and is protected by copyright laws. You may not use our content without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
            <p>
              ShopHub shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services or products purchased through our website.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">9. Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">10. Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at legal@shophub.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
