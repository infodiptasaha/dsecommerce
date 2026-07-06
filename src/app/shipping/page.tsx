import Link from "next/link";

const shippingMethods = [
  { name: "Standard Shipping", time: "5-7 business days", price: "Free on orders over $100", otherwise: "$9.99" },
  { name: "Express Shipping", time: "2-3 business days", price: "$14.99", otherwise: "" },
  { name: "Overnight Shipping", time: "1 business day", price: "$24.99", otherwise: "" },
];

const faqs = [
  { q: "Do you offer free shipping?", a: "Yes! We offer free standard shipping on all orders over $100. For orders under $100, standard shipping is $9.99." },
  { q: "Can I change my shipping address?", a: "You can update your shipping address within 2 hours of placing your order. After that, please contact support for assistance." },
  { q: "Do you ship internationally?", a: "We currently ship to the US, Canada, UK, and EU countries. International shipping rates are calculated at checkout based on destination." },
  { q: "How do I track my shipment?", a: "Once shipped, you'll receive an email with a tracking number. You can also track your order on our Order Tracking page." },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Shipping Info</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Shipping Information</h1>
        <p className="text-gray-400 text-sm mb-10">Everything you need to know about our shipping options and policies.</p>

        {/* Shipping Methods */}
        <div className="space-y-3 mb-12">
          {shippingMethods.map((method, i) => (
            <div key={i} className="p-5 border border-gray-100 rounded-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{method.name}</h3>
                  <p className="text-xs text-gray-400">{method.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{method.price}</p>
                  {method.otherwise && <p className="text-xs text-gray-400">{method.otherwise} otherwise</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* International */}
        <div className="bg-gray-50 rounded-xl p-6 mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-3">International Shipping</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            We ship to over 20 countries worldwide. International shipping costs are calculated at checkout based on your location and the items in your cart.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Please note that international orders may be subject to customs duties and taxes, which are the responsibility of the recipient.
          </p>
        </div>

        {/* FAQs */}
        <h2 className="text-lg font-bold text-gray-900 mb-5">Shipping FAQs</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                {faq.q}
                <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
