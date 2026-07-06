import Link from "next/link";

const contactMethods = [
  { icon: "📧", title: "Email", value: "support@shophub.com", desc: "We respond within 24 hours" },
  { icon: "📞", title: "Phone", value: "1-800-SHOP-HUB", desc: "Mon-Fri, 9am-6pm EST" },
  { icon: "💬", title: "Live Chat", value: "Available 24/7", desc: "Instant support" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Contact Us</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-400 text-sm mb-10">Have a question? We'd love to hear from you.</p>

        {/* Contact Methods */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {contactMethods.map((method, i) => (
            <div key={i} className="text-center p-5 bg-gray-50 rounded-xl">
              <span className="text-2xl block mb-2">{method.icon}</span>
              <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{method.title}</h3>
              <p className="text-sm font-medium text-gray-700 mb-1">{method.value}</p>
              <p className="text-xs text-gray-400">{method.desc}</p>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Send Us a Message</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">First Name</label>
                <input type="text" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Last Name</label>
                <input type="text" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Subject</label>
              <select className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer">
                <option>General Inquiry</option>
                <option>Order Support</option>
                <option>Returns & Exchanges</option>
                <option>Shipping Question</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Message</label>
              <textarea rows={4} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none" />
            </div>
            <button type="submit" className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Send Message
            </button>
          </form>
        </div>

        {/* Office */}
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Our Office</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            123 Commerce Street<br />
            San Francisco, CA 94105<br />
            United States
          </p>
        </div>
      </div>
    </div>
  );
}
