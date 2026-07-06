import Link from "next/link";

const openings = [
  { title: "Senior Frontend Engineer", department: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Product Designer", department: "Design", location: "New York, NY", type: "Full-time" },
  { title: "Marketing Manager", department: "Marketing", location: "Remote", type: "Full-time" },
  { title: "Customer Support Specialist", department: "Support", location: "Remote", type: "Full-time" },
  { title: "Supply Chain Coordinator", department: "Operations", location: "Los Angeles, CA", type: "Full-time" },
];

const benefits = [
  { icon: "🏠", title: "Remote Flexibility", desc: "Work from anywhere with flexible hours." },
  { icon: "💊", title: "Health Coverage", desc: "Comprehensive medical, dental, and vision insurance." },
  { icon: "📚", title: "Learning Budget", desc: "Annual budget for courses, books, and conferences." },
  { icon: "🌴", title: "Unlimited PTO", desc: "Take the time you need to recharge." },
  { icon: "💰", title: "Equity Options", desc: "Join our mission and share in our success." },
  { icon: "🎉", title: "Team Events", desc: "Regular team retreats and social events." },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Careers</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Careers at ShopHub</h1>
        <p className="text-gray-400 text-sm mb-10">Join our team and help us build the future of e-commerce.</p>

        {/* Benefits */}
        <h2 className="text-lg font-bold text-gray-900 mb-5">Why Work With Us</h2>
        <div className="grid grid-cols-2 gap-4 mb-12">
          {benefits.map((b, i) => (
            <div key={i} className="p-4 border border-gray-100 rounded-xl">
              <span className="text-xl block mb-2">{b.icon}</span>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{b.title}</h3>
              <p className="text-xs text-gray-400">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Open Positions */}
        <h2 className="text-lg font-bold text-gray-900 mb-5">Open Positions</h2>
        <div className="space-y-3">
          {openings.map((job, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{job.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{job.department}</span>
                  <span>·</span>
                  <span>{job.location}</span>
                  <span>·</span>
                  <span>{job.type}</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
