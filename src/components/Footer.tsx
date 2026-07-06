"use client";

import Link from "next/link";

const footerSections = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "New Arrivals", href: "/products?sort=-createdAt" },
      { label: "Best Sellers", href: "/products?sort=-averageRating" },
      { label: "Sale", href: "/products?sort=price" },
      { label: "Gift Cards", href: "/products" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Shipping Info", href: "/shipping" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "Order Tracking", href: "/track-order" },
      { label: "FAQ", href: "/help" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/about" },
      { label: "Blog", href: "/about" },
      { label: "Affiliates", href: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/privacy" },
      { label: "Accessibility", href: "/terms" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "hello@shophub.com", href: "mailto:hello@shophub.com" },
      { label: "+1 (234) 567-890", href: "tel:+1234567890" },
      { label: "123 Commerce St", href: "#" },
      { label: "New York, NY 10001", href: "#" },
    ],
  },
];

const socials = [
  { label: "Twitter", path: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" },
  { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { label: "YouTube", path: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z" },
  { label: "Pinterest", path: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none" />

      <div className="relative">
        {/* Trust Bar */}
        <div className="border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", text: "Free Shipping" },
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", text: "Secure Checkout" },
                { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", text: "30-Day Returns" },
                { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", text: "24/7 Support" },
              ].map((item) => (
                <div key={item.text} className="flex items-center justify-center gap-2.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="text-xs font-medium text-gray-400">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Brand Column */}
            <div className="lg:w-[280px] flex-shrink-0">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-gray-950 font-bold text-base">S</span>
                </div>
                <span className="text-xl font-bold tracking-tight">
                  SHOP<span className="text-gray-500">HUB</span>
                </span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
                Curated products for modern living. Quality meets affordability.
              </p>

              {/* Newsletter */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-white mb-3">Subscribe to our newsletter</p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 min-w-0 px-4 py-3 rounded-l-xl bg-white/5 border border-white/10 border-r-0 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/25 transition-all"
                  />
                  <button className="px-5 py-3 bg-white text-gray-950 font-semibold rounded-r-xl text-sm hover:bg-gray-100 transition-colors whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
                <p className="text-[11px] text-gray-600 mt-2">No spam, unsubscribe anytime.</p>
              </div>

              {/* Social Icons */}
              <div className="flex gap-2">
                {socials.map((s) => (
                  <a key={s.label} href="#" aria-label={s.label}
                    className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 hover:scale-110 transition-all duration-300 group">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* 5 Link Columns */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-4">{section.title}</h4>
                  <ul className="space-y-2.5">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group">
                          <span className="w-0 group-hover:w-1.5 h-px bg-white transition-all duration-300" />
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-600 text-xs">&copy; 2026 ShopHub. All rights reserved.</p>

              <div className="flex items-center gap-5">
                {/* Payment Methods */}
                <div className="flex items-center gap-2">
                  <div className="h-7 px-2.5 bg-white/5 rounded-md flex items-center justify-center border border-white/5">
                    <svg className="h-4" viewBox="0 0 50 32" fill="none"><rect width="50" height="32" rx="4" fill="#1a1f71"/><text x="6" y="21" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">VISA</text></svg>
                  </div>
                  <div className="h-7 px-2.5 bg-white/5 rounded-md flex items-center justify-center border border-white/5">
                    <svg className="h-4" viewBox="0 0 50 32" fill="none"><rect width="50" height="32" rx="4" fill="#1a1f71"/><circle cx="18" cy="16" r="9" fill="#eb001b"/><circle cx="32" cy="16" r="9" fill="#f79e1b" opacity="0.8"/></svg>
                  </div>
                  <div className="h-7 px-2.5 bg-white/5 rounded-md flex items-center justify-center border border-white/5">
                    <svg className="h-4" viewBox="0 0 50 32" fill="none"><rect width="50" height="32" rx="4" fill="#000"/><text x="4" y="21" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Pay</text><text x="24" y="21" fill="#00a1e4" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Pal</text></svg>
                  </div>
                </div>

                <span className="w-px h-4 bg-white/10" />

                {/* Back to Top */}
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors group"
                >
                  Back to top
                  <svg className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
