import Link from "next/link";

const faqs = [
  { q: "How do I track my order?", a: "Once your order is shipped, you'll receive a confirmation email with a tracking number. You can use this number on our Order Tracking page or the carrier's website." },
  { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards (Visa, Mastercard, Amex), PayPal, and cash on delivery (COD) for eligible orders." },
  { q: "How do I return an item?", a: "You can initiate a return within 30 days of delivery. Go to your Order History, select the item, and click 'Return'. We'll provide a prepaid shipping label." },
  { q: "How long does shipping take?", a: "Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. Free shipping is available on orders over $100." },
  { q: "Can I cancel my order?", a: "Orders can be cancelled within 2 hours of placement. After that, the order may have already been processed. Contact support for assistance." },
  { q: "Do you ship internationally?", a: "Currently we ship to the US, Canada, UK, and EU countries. International shipping rates vary by destination and are calculated at checkout." },
];

const contactOptions = [
  { icon: "💬", title: "Live Chat", desc: "Available 24/7", action: "Start Chat" },
  { icon: "📧", title: "Email", desc: "support@shophub.com", action: "Send Email" },
  { icon: "📞", title: "Phone", desc: "1-800-SHOP-HUB", action: "Call Now" },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Help Center</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Help Center</h1>
        <p className="text-gray-400 text-sm mb-10">Find answers to common questions or contact our support team.</p>

        {/* Contact Options */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {contactOptions.map((opt, i) => (
            <div key={i} className="text-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <span className="text-2xl block mb-2">{opt.icon}</span>
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{opt.title}</h3>
              <p className="text-xs text-gray-400 mb-3">{opt.desc}</p>
              <span className="text-xs font-medium text-gray-600">{opt.action}</span>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <h2 className="text-lg font-bold text-gray-900 mb-5">Frequently Asked Questions</h2>
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
