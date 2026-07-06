import Link from "next/link";

const quickLinks = [
  { label: "Homepage", href: "/", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { label: "Shop All", href: "/products", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  { label: "Track Order", href: "/track-order", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { label: "Help Center", href: "/help", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

const popularPages = [
  { label: "Shipping Info", href: "/shipping" },
  { label: "Returns & Exchanges", href: "/returns" },
  { label: "Contact Us", href: "/contact" },
  { label: "About ShopHub", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="text-[120px] font-black text-gray-100 leading-none select-none">404</div>
          <h1 className="text-2xl font-bold text-gray-900 -mt-4">Page not found</h1>
          <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all text-left group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
              </svg>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 mb-3">Or try one of these popular pages</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                {page.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
