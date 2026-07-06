import Link from "next/link";

const steps = [
  { step: "1", title: "Initiate Return", desc: "Go to your Order History and select the item you want to return." },
  { step: "2", title: "Print Label", desc: "We'll provide a prepaid shipping label via email." },
  { step: "3", title: "Pack & Ship", desc: "Pack the item securely and drop it off at your nearest carrier location." },
  { step: "4", title: "Get Refund", desc: "Once we receive and inspect the item, your refund will be processed within 3-5 business days." },
];

const conditions = [
  "Items must be returned within 30 days of delivery",
  "Items must be unused and in original packaging",
  "All tags must be attached",
  "Sale items are final sale and cannot be returned",
  "Custom or personalized items are non-returnable",
  "Free returns for defective or wrong items sent",
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Returns & Exchanges</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Returns & Exchanges</h1>
        <p className="text-gray-400 text-sm mb-10">We want you to love your purchase. If something isn't right, we're here to help.</p>

        {/* Return Policy */}
        <div className="bg-gray-50 rounded-xl p-6 mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Return Policy</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            We accept returns and exchanges within 30 days of delivery. Items must be in their original condition with all tags attached. Refunds are processed to your original payment method within 3-5 business days of receiving the return.
          </p>
        </div>

        {/* How to Return */}
        <h2 className="text-lg font-bold text-gray-900 mb-5">How to Return an Item</h2>
        <div className="grid grid-cols-2 gap-4 mb-12">
          {steps.map((s, i) => (
            <div key={i} className="p-5 border border-gray-100 rounded-xl">
              <div className="w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs font-bold mb-3">{s.step}</div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Conditions */}
        <h2 className="text-lg font-bold text-gray-900 mb-5">Return Conditions</h2>
        <ul className="space-y-2.5 mb-12">
          {conditions.map((c, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {c}
            </li>
          ))}
        </ul>

        {/* Exchange */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Exchanges</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Need a different size or color? You can exchange your item for a new one within 30 days. Simply initiate a return and place a new order for the item you want.
          </p>
        </div>
      </div>
    </div>
  );
}
