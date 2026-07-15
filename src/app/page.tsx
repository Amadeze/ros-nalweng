"use client";

import { ShaderBackground } from "@/components/ShaderBackground";
import Link from "next/link";
import { useEffect } from "react";
import { Menu, Inventory, LocalFireDepartment, Storefront, AccountBalance, Check } from "@mui/icons-material"; // Will use Lucide instead

import { Menu as MenuIcon, Package, Flame, Store, Landmark, Check as CheckIcon } from "lucide-react";

export default function LandingPage() {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-deep-obsidian text-on-background font-body-lg antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col relative overflow-x-hidden dark">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 nav-blur transition-all duration-300">
        <div className="flex justify-between items-center h-20 px-container-margin max-w-screen-2xl mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <img alt="Beanslab Logo" className="w-8 h-8 object-contain" src="/logo.png" />
            <span className="font-headline-md text-headline-md font-semibold text-on-background tracking-tight">Beanslab</span>
          </div>
          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex gap-8">
            <a className="text-body-md text-on-surface-variant hover:text-primary-container transition-colors" href="#">Inventory</a>
            <a className="text-body-md text-on-surface-variant hover:text-primary-container transition-colors" href="#">Roasting</a>
            <a className="text-body-md text-on-surface-variant hover:text-primary-container transition-colors" href="#">B2B Portal</a>
            <a className="text-body-md text-on-surface-variant hover:text-primary-container transition-colors" href="#">Accounting</a>
          </nav>
          {/* Actions */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/login" className="text-body-md text-on-surface-variant hover:text-primary-container transition-colors">Log in</Link>
            <Link href="/register" className="bg-primary-container text-on-primary-container font-label-caps text-label-caps px-6 py-3 rounded-full hover:bg-white transition-all duration-300 font-semibold shadow-[0_4px_20px_rgba(212,163,115,0.2)]">Start Trial</Link>
          </div>
          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-primary-container">
            <MenuIcon className="w-8 h-8" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow z-10 relative pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center px-container-margin py-stack-lg overflow-hidden">
          <div className="absolute inset-0 w-full h-full z-0 object-cover opacity-60">
            <ShaderBackground />
          </div>
          <div className="absolute inset-0 z-0 opacity-100 mix-blend-screen pointer-events-none flex justify-end items-center">
            <div className="relative w-full max-w-4xl translate-x-1/4">
              <div className="absolute inset-0 bg-primary-container/20 blur-[120px] rounded-full"></div>
              <img alt="Glowing Coffee Bean" className="w-full h-auto object-cover animate-fade-up delay-400 relative z-10" src="https://lh3.googleusercontent.com/aida/AP1WRLteKwED-8ySmpijRoptPdaas_fot1hsMAxm48v64TGYl8i9Pj17a9VeMMyECYdd7-WeDWEYkFoMQEYgX16Vvnrvnyg18jnP8nv9o9uKQ5oAEYksFJTgUuCfES7FzftIF4A6qsQGH2VHnShz2VyJwe2XboNo1eGMrIBSuiZ8DAvbLXEf9-gOEDsKDSnk2amnI4IAdMEDXFfeB5DG0DMlhbFwiObFi_CxXFuiDgUgFONO6L-pksBkKYGmIGE" />
            </div>
          </div>
          
          <div className="max-w-screen-2xl mx-auto w-full z-10 grid md:grid-cols-2 gap-gutter items-center relative">
            <div className="flex flex-col gap-8 max-w-2xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary-container/30 bg-surface-variant/30 backdrop-blur-sm w-fit animate-fade-up">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                <span className="font-label-caps text-label-caps text-primary-container tracking-wider">Elevating Craft Coffee</span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-background animate-fade-up delay-100">
                Run your entire <br/><span className="text-primary-container">roastery</span><br/> from one platform.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl animate-fade-up delay-200 text-lg">
                From green bean inventory to roasting logs, accounting, and your own dedicated B2B portal. Built specifically for modern specialty coffee roasteries.
              </p>
              <div className="flex flex-wrap gap-4 mt-4 animate-fade-up delay-300">
                <Link href="/register" className="bg-primary-container text-on-primary-container font-label-caps text-label-caps font-semibold px-8 py-4 rounded-full hover:bg-white transition-all duration-300 shadow-[0_4px_20px_rgba(212,163,115,0.25)]">
                  Start Free Trial
                </Link>
                <button className="border border-primary-container/30 bg-white/5 backdrop-blur-md text-on-background font-label-caps text-label-caps font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300">
                  Book a Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-stack-lg px-container-margin relative z-10 bg-deep-obsidian">
          <div className="absolute inset-0 w-full h-full z-0 object-cover opacity-20 mix-blend-screen">
            <ShaderBackground />
          </div>
          
          <div className="max-w-screen-2xl mx-auto flex flex-col gap-stack-md relative z-10">
            <div className="text-left max-w-2xl mb-12 reveal-on-scroll">
              <h2 className="font-headline-lg text-headline-lg text-on-background mb-6">Everything you need to scale</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant text-xl">Precision tools designed to eliminate guesswork and streamline your roasting operations.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[340px]">
              {/* Feature 1 */}
              <div className="md:col-span-2 glass-panel rounded-2xl p-10 flex flex-col justify-between group overflow-hidden relative reveal-on-scroll delay-100">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="z-10">
                  <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 flex items-center justify-center mb-8 border border-white/5">
                    <Package className="w-8 h-8 text-primary-container" />
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-background mb-4">Smart Inventory</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md text-lg">Track green coffee origins, moisture loss, and shrinkage automatically. Never run out of your core offerings.</p>
                </div>
                <div className="z-10 flex gap-3 mt-6">
                  <span className="px-4 py-1.5 rounded-full bg-surface-variant/50 border border-white/5 font-label-caps text-label-caps text-on-surface-variant">Traceability</span>
                  <span className="px-4 py-1.5 rounded-full bg-surface-variant/50 border border-white/5 font-label-caps text-label-caps text-on-surface-variant">Forecasting</span>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="glass-panel rounded-2xl p-10 flex flex-col justify-between group relative overflow-hidden reveal-on-scroll delay-200">
                <div className="z-10">
                  <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 flex items-center justify-center mb-8 border border-white/5">
                    <Flame className="w-8 h-8 text-primary-container" />
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-background mb-4">Roasting & Production</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant text-lg">Log profiles, track RoR, and maintain consistency across batches.</p>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="glass-panel rounded-2xl p-10 flex flex-col justify-between group relative overflow-hidden reveal-on-scroll delay-100">
                <div className="z-10">
                  <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 flex items-center justify-center mb-8 border border-white/5">
                    <Store className="w-8 h-8 text-primary-container" />
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-background mb-4">Custom B2B Portal</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant text-lg">Give wholesale clients a seamless ordering experience.</p>
                </div>
              </div>
              
              {/* Feature 4 */}
              <div className="md:col-span-2 glass-panel rounded-2xl p-10 flex flex-col justify-between group overflow-hidden relative reveal-on-scroll delay-200">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="z-10">
                  <div className="w-16 h-16 rounded-2xl bg-surface-variant/50 flex items-center justify-center mb-8 border border-white/5">
                    <Landmark className="w-8 h-8 text-primary-container" />
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-background mb-4">Finance & Accounting</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md text-lg">Sync directly with major accounting software. Automate invoicing and track true margins per roast.</p>
                </div>
                <div className="z-10 flex gap-3 mt-6">
                  <span className="px-4 py-1.5 rounded-full bg-surface-variant/50 border border-white/5 font-label-caps text-label-caps text-on-surface-variant">Invoicing</span>
                  <span className="px-4 py-1.5 rounded-full bg-surface-variant/50 border border-white/5 font-label-caps text-label-caps text-on-surface-variant">Margins</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-stack-lg px-container-margin bg-deep-obsidian relative z-10 pb-32">
          <div className="max-w-screen-xl mx-auto flex flex-col gap-stack-md">
            <div className="text-center max-w-2xl mx-auto mb-16 reveal-on-scroll">
              <h2 className="font-headline-lg text-headline-lg text-on-background mb-6">Simple, transparent pricing</h2>
              <p className="font-body-lg text-body-lg text-primary-container text-xl">Plans that scale with your roasting volume.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Basic Plan */}
              <div className="glass-panel rounded-2xl p-10 flex flex-col gap-8 reveal-on-scroll delay-100">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-background">Starter</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2">For micro-roasteries.</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-xl text-metric-xl text-on-background">$49</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">/mo</span>
                </div>
                <ul className="flex flex-col gap-5 font-body-md text-body-md text-on-surface-variant flex-grow">
                  <li className="flex items-center gap-4"><CheckIcon className="text-primary-container w-5 h-5" /> Up to 500kg/mo</li>
                  <li className="flex items-center gap-4"><CheckIcon className="text-primary-container w-5 h-5" /> Basic Inventory</li>
                  <li className="flex items-center gap-4"><CheckIcon className="text-primary-container w-5 h-5" /> Manual Roasting Logs</li>
                </ul>
                <Link href="/register" className="w-full mt-4 border border-white/10 bg-white/5 text-on-background font-label-caps text-label-caps py-4 rounded-full hover:bg-white/10 transition-all font-semibold block text-center">Start Free Trial</Link>
              </div>
              
              {/* Pro Plan */}
              <div className="glass-panel rounded-2xl p-10 flex flex-col gap-8 border border-primary-container/30 relative transform md:scale-105 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 reveal-on-scroll delay-200 bg-surface-variant/40">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container font-label-caps text-label-caps px-6 py-1.5 rounded-full shadow-lg">Most Popular</div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary-container font-semibold">Professional</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2">For growing wholesale operations.</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-xl text-metric-xl text-on-background">$129</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">/mo</span>
                </div>
                <ul className="flex flex-col gap-5 font-body-md text-body-md text-on-surface-variant flex-grow">
                  <li className="flex items-center gap-4"><CheckIcon className="text-primary-container w-5 h-5" /> Up to 2,000kg/mo</li>
                  <li className="flex items-center gap-4"><CheckIcon className="text-primary-container w-5 h-5" /> Advanced Inventory & Traceability</li>
                  <li className="flex items-center gap-4"><CheckIcon className="text-primary-container w-5 h-5" /> Automated Roasting Curves</li>
                  <li className="flex items-center gap-4"><CheckIcon className="text-primary-container w-5 h-5" /> B2B Ordering Portal</li>
                </ul>
                <Link href="/register" className="w-full mt-4 bg-primary-container text-on-primary-container font-label-caps text-label-caps py-4 rounded-full hover:bg-white transition-all duration-300 font-semibold shadow-[0_4px_20px_rgba(212,163,115,0.25)] block text-center">Start Free Trial</Link>
              </div>
              
              {/* Enterprise Plan */}
              <div className="glass-panel rounded-2xl p-10 flex flex-col gap-8 reveal-on-scroll delay-300">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-background">Scale</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2">For large facilities.</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-metric-xl text-metric-xl text-on-background">$299</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">/mo</span>
                </div>
                <ul className="flex flex-col gap-5 font-body-md text-body-md text-on-surface-variant flex-grow">
                  <li className="flex items-center gap-4"><CheckIcon className="text-primary-container w-5 h-5" /> Unlimited Volume</li>
                  <li className="flex items-center gap-4"><CheckIcon className="text-primary-container w-5 h-5" /> Multi-Facility Support</li>
                  <li className="flex items-center gap-4"><CheckIcon className="text-primary-container w-5 h-5" /> Accounting API Integrations</li>
                  <li className="flex items-center gap-4"><CheckIcon className="text-primary-container w-5 h-5" /> Dedicated Success Manager</li>
                </ul>
                <button className="w-full mt-4 border border-white/10 bg-white/5 text-on-background font-label-caps text-label-caps py-4 rounded-full hover:bg-white/10 transition-all font-semibold">Contact Sales</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-20 bg-surface-container-lowest z-10 relative border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-container-margin max-w-screen-2xl mx-auto relative z-10">
          {/* Brand Column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="flex items-center gap-3">
              <img alt="Beanslab Logo" className="w-8 h-8 object-contain" src="/logo.png" />
              <span className="font-headline-md text-headline-md font-semibold text-on-background tracking-tight">Beanslab</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              The Next Generation Coffee Management.<br/>
              Elevating the craft of specialty coffee roasting through precision tools and organic insights.
            </p>
            <p className="text-sm text-on-surface-variant/50 mt-4">
              © {new Date().getFullYear()} Beanslab. All rights reserved.
            </p>
          </div>
          
          {/* Links */}
          <div className="flex flex-col gap-4">
            <span className="font-label-caps text-label-caps text-on-background mb-2">Platform</span>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary-container transition-colors" href="#">Product</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary-container transition-colors" href="#">Features</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary-container transition-colors" href="#">Pricing</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-label-caps text-label-caps text-on-background mb-2">Company</span>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary-container transition-colors" href="#">Privacy</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary-container transition-colors" href="#">Terms</a>
            <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary-container transition-colors" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}