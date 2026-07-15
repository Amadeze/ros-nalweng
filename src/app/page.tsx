import Link from "next/link";
import { Coffee, ArrowRight, BarChart3, Package, Users, Globe } from "lucide-react";

export default function RootPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30">
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-900/20">
              <Coffee className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Roastery OS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-amber-950 px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            The Next Generation Coffee Management
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 max-w-4xl mx-auto leading-tight">
            Run your entire roastery from one platform.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            From green bean inventory to roasting logs, accounting, and your own dedicated B2B portal. Built specifically for modern specialty coffee roasteries.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold tracking-wide transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold transition-all flex items-center justify-center gap-2">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">Everything you need to scale</h2>
            <p className="text-slate-400">Stop juggling spreadsheets. Roastery OS unites your entire operation.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Package className="w-8 h-8 text-amber-400" />}
              title="Smart Inventory"
              description="Track green beans and finished goods automatically. Calculate shrinkage and COGS in real-time."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8 text-amber-400" />}
              title="Roasting & Production"
              description="Log every roast batch, monitor yields, and manage production schedules with precision."
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-amber-400" />}
              title="Custom B2B Portal"
              description="Get your own branded subdomain (e.g., you.beanslab.vercel.app) for wholesale clients to browse catalogs."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-amber-400" />}
              title="Finance & Accounting"
              description="Generate P&L reports, track operational expenses, and manage receivables effortlessly."
            />
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400">Start for free, then choose a plan that scales with your roastery.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Basic</h3>
              <p className="text-slate-400 text-sm mb-6">For small roasteries getting started.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">Rp 150k</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="text-slate-300 text-sm flex items-center gap-2">✓ Core Inventory</li>
                <li className="text-slate-300 text-sm flex items-center gap-2">✓ Roasting Logs</li>
                <li className="text-slate-300 text-sm flex items-center gap-2">✓ Basic B2B Portal</li>
              </ul>
              <Link href="/register" className="block text-center w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors">Start 14-Day Trial</Link>
            </div>

            {/* Pro */}
            <div className="bg-amber-500/10 border border-amber-500/50 rounded-3xl p-8 flex flex-col relative shadow-2xl shadow-amber-900/20">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-amber-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
              <h3 className="text-xl font-bold text-amber-500 mb-2">Pro</h3>
              <p className="text-slate-400 text-sm mb-6">For growing wholesale operations.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">Rp 299k</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="text-slate-300 text-sm flex items-center gap-2">✓ Everything in Basic</li>
                <li className="text-slate-300 text-sm flex items-center gap-2">✓ Custom Domain (you.com)</li>
                <li className="text-slate-300 text-sm flex items-center gap-2">✓ Payment Gateway (Midtrans)</li>
                <li className="text-slate-300 text-sm flex items-center gap-2">✓ Advanced Analytics</li>
              </ul>
              <Link href="/register" className="block text-center w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold transition-colors">Start 14-Day Trial</Link>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-slate-400 text-sm mb-6">For multi-branch large operations.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">Custom</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="text-slate-300 text-sm flex items-center gap-2">✓ Unlimited Locations</li>
                <li className="text-slate-300 text-sm flex items-center gap-2">✓ Dedicated Support</li>
                <li className="text-slate-300 text-sm flex items-center gap-2">✓ Custom API Access</li>
              </ul>
              <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-800 text-center">
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Roastery Operating System. Crafted for specialty coffee.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl hover:border-amber-500/50 transition-colors group">
      <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}