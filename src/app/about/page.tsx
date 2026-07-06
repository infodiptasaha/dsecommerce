import Link from "next/link";

const team = [
  { name: "Sarah Chen", role: "Founder & CEO", image: "👩‍💼" },
  { name: "Marcus Williams", role: "Head of Product", image: "👨‍💻" },
  { name: "Emily Rodriguez", role: "Design Lead", image: "👩‍🎨" },
  { name: "James Park", role: "Engineering Lead", image: "👨‍🔧" },
];

const values = [
  { icon: "✨", title: "Quality First", desc: "Every product is carefully curated and tested before it reaches you." },
  { icon: "🤝", title: "Customer Obsessed", desc: "Your satisfaction is our top priority. We're here for you 24/7." },
  { icon: "🌍", title: "Sustainability", desc: "We're committed to reducing our environmental impact." },
  { icon: "💡", title: "Innovation", desc: "We constantly seek better ways to serve you." },
];

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "500+", label: "Products" },
  { value: "4.8", label: "Average Rating" },
  { value: "24/7", label: "Support" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">About Us</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">About ShopHub</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
            We started with a simple idea: make quality products accessible to everyone. Since 2020, we've been curating the best products from around the world, bringing them to your doorstep with care and attention.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Our Story */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Our Story</h2>
          <div className="space-y-3 text-sm text-gray-500 leading-relaxed">
            <p>
              What began as a small online shop run from a garage has grown into a trusted destination for thousands of customers worldwide. Our journey started when our founder, Sarah Chen, noticed a gap in the market for affordable, high-quality products.
            </p>
            <p>
              Today, we partner with over 100 brands and independent makers to bring you a carefully curated selection of products across electronics, fashion, home goods, and more.
            </p>
          </div>
        </div>

        {/* Values */}
        <h2 className="text-lg font-bold text-gray-900 mb-5">Our Values</h2>
        <div className="grid grid-cols-2 gap-4 mb-12">
          {values.map((v, i) => (
            <div key={i} className="p-5 border border-gray-100 rounded-xl">
              <span className="text-xl block mb-2">{v.icon}</span>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{v.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <h2 className="text-lg font-bold text-gray-900 mb-5">Our Team</h2>
        <div className="grid grid-cols-2 gap-4">
          {team.map((member, i) => (
            <div key={i} className="p-5 bg-gray-50 rounded-xl text-center">
              <span className="text-3xl block mb-2">{member.image}</span>
              <h3 className="text-sm font-semibold text-gray-900">{member.name}</h3>
              <p className="text-xs text-gray-400">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
