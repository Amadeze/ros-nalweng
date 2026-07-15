"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { registerTenant } from "./actions";
import { Loader2, Store, AtSign, Key, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ShaderBackground } from "@/components/ShaderBackground";

type PlanTier = "BASIC" | "PRO" | "ENTERPRISE";

function RegisterForm() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>("PRO");

  const [roasteryName, setRoasteryName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roasteryName || !subdomain || !email || !password) {
      setError("All fields are required");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await registerTenant({ 
        roasteryName, 
        subdomain, 
        email, 
        password,
        tier: selectedPlan
      });
      if (!result.success) {
        setError(result.error);
        setStep(1); // Go back if error is from fields
        return;
      }
      // Pendaftaran berhasil, arahkan ke login
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="text-center">
          <h2 className="font-headline-md text-headline-md text-on-background mb-2">Select your plan</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Start your 14-day free trial. No credit card required.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Starter Plan */}
          <button 
            type="button"
            onClick={() => setSelectedPlan("BASIC")}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
              selectedPlan === "BASIC" 
                ? "bg-primary-container/10 border-primary-container shadow-[0_0_15px_rgba(212,163,115,0.15)]" 
                : "bg-surface-variant/30 border-white/5 hover:border-white/20"
            }`}
          >
            <div className="text-left">
              <h3 className="font-headline-md text-xl text-on-background">Starter</h3>
              <p className="font-body-md text-sm text-on-surface-variant">Up to 500kg/mo</p>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <span className="font-headline-md text-2xl text-on-background">$49</span>
                <span className="font-body-md text-sm text-on-surface-variant">/mo</span>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${selectedPlan === "BASIC" ? "border-primary-container bg-primary-container" : "border-white/20"}`}>
                {selectedPlan === "BASIC" && <CheckCircle2 className="w-4 h-4 text-on-primary-container" />}
              </div>
            </div>
          </button>

          {/* Professional Plan */}
          <button 
            type="button"
            onClick={() => setSelectedPlan("PRO")}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 relative ${
              selectedPlan === "PRO" 
                ? "bg-primary-container/10 border-primary-container shadow-[0_0_15px_rgba(212,163,115,0.15)]" 
                : "bg-surface-variant/30 border-white/5 hover:border-white/20"
            }`}
          >
            <div className="absolute -top-3 left-4 bg-primary-container text-on-primary-container text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div className="text-left mt-1">
              <h3 className="font-headline-md text-xl text-primary-container font-semibold">Professional</h3>
              <p className="font-body-md text-sm text-on-surface-variant">Up to 2,000kg/mo</p>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <span className="font-headline-md text-2xl text-on-background">$129</span>
                <span className="font-body-md text-sm text-on-surface-variant">/mo</span>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${selectedPlan === "PRO" ? "border-primary-container bg-primary-container" : "border-white/20"}`}>
                {selectedPlan === "PRO" && <CheckCircle2 className="w-4 h-4 text-on-primary-container" />}
              </div>
            </div>
          </button>

          {/* Scale Plan */}
          <button 
            type="button"
            onClick={() => setSelectedPlan("ENTERPRISE")}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
              selectedPlan === "ENTERPRISE" 
                ? "bg-primary-container/10 border-primary-container shadow-[0_0_15px_rgba(212,163,115,0.15)]" 
                : "bg-surface-variant/30 border-white/5 hover:border-white/20"
            }`}
          >
            <div className="text-left">
              <h3 className="font-headline-md text-xl text-on-background">Scale</h3>
              <p className="font-body-md text-sm text-on-surface-variant">Unlimited Volume</p>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <span className="font-headline-md text-2xl text-on-background">$299</span>
                <span className="font-body-md text-sm text-on-surface-variant">/mo</span>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${selectedPlan === "ENTERPRISE" ? "border-primary-container bg-primary-container" : "border-white/20"}`}>
                {selectedPlan === "ENTERPRISE" && <CheckCircle2 className="w-4 h-4 text-on-primary-container" />}
              </div>
            </div>
          </button>
        </div>

        <div className="pt-6 flex gap-4">
          <button 
            type="button" 
            onClick={() => setStep(1)}
            disabled={loading}
            className="flex-1 border border-white/10 bg-white/5 text-on-background font-label-caps text-label-caps h-12 rounded-full hover:bg-white/10 transition-all font-semibold"
          >
            Back
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] bg-primary-container text-on-primary-container font-label-caps text-label-caps h-12 rounded-full hover:bg-white transition-all duration-300 font-semibold shadow-[0_4px_20px_rgba(212,163,115,0.25)] flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleNextStep} className="space-y-5 animate-fade-up">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Roastery Name</label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Senja Roastery"
            value={roasteryName}
            onChange={(e) => {
              setRoasteryName(e.target.value);
              // Auto generate subdomain
              if (!subdomain || subdomain === roasteryName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')) {
                setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
              }
            }}
            className="w-full h-12 pl-10 text-sm bg-surface-variant/30 text-on-background border border-white/10 rounded-xl focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all placeholder:text-on-surface-variant/50"
            required
          />
          <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Portal Subdomain</label>
        <div className="flex rounded-xl overflow-hidden border border-white/10 focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container transition-all bg-surface-variant/30">
          <div className="pl-4 pr-2 py-3 bg-surface-variant/50 text-on-surface-variant text-sm font-medium border-r border-white/10">
            https://
          </div>
          <input
            type="text"
            placeholder="senja"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="flex-1 h-12 px-3 text-sm bg-transparent text-on-background outline-none placeholder:text-on-surface-variant/50"
            required
          />
          <div className="pr-4 pl-2 py-3 bg-surface-variant/50 text-on-surface-variant text-sm font-medium border-l border-white/10">
            .beanslab.vercel.app
          </div>
        </div>
        <p className="text-[11px] text-on-surface-variant/70">Your dedicated B2B wholesale portal.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Work Email</label>
        <div className="relative">
          <input
            type="email"
            placeholder="admin@senjaroastery.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 pl-10 text-sm bg-surface-variant/30 text-on-background border border-white/10 rounded-xl focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all placeholder:text-on-surface-variant/50"
            required
          />
          <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Password</label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 pl-10 pr-10 text-sm bg-surface-variant/30 text-on-background border border-white/10 rounded-xl focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all placeholder:text-on-surface-variant/50"
            required
          />
          <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors"
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm text-center">
          {error}
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          className="w-full h-12 bg-primary-container text-on-primary-container font-label-caps text-label-caps rounded-full hover:bg-white transition-all duration-300 font-semibold shadow-[0_4px_20px_rgba(212,163,115,0.25)] flex items-center justify-center"
        >
          Continue to Plan Selection
        </button>
      </div>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-deep-obsidian font-body-lg dark">
      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-40 mix-blend-screen pointer-events-none">
        <ShaderBackground />
      </div>

      <div className="w-full max-w-screen-xl mx-auto flex items-center justify-center lg:justify-between px-6 py-12 relative z-10">
        
        {/* Left Side: Branding / Value Prop (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col max-w-lg gap-8">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <img alt="Beanslab Logo" className="w-10 h-10 object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLurQEuvujgYcc2qdi9Hk7VBR9uKnsfcsrQQfhjVLONCU-YGQr2P6-cu8P1mY2BOaKTrN1wUOnC8afdEy9lf5kx_Hn0eU7iMH8wC83QHmJWlyf_TkaJsl0cEAEUb6cG1cQBx3Jgzs4fRq2SOJfUW6jALPIhHwk0R5EzN2xqlEY7Hzf2E5ZB_7sR9laCQJSSJ9iXB16apiIdfZ1DS5pL2GXebp3z7BQWrL6peLwj-aE1SosPUm_-RkXO8adm4" />
            <span className="font-headline-md text-2xl font-semibold text-on-background tracking-tight">Beanslab</span>
          </Link>
          <h1 className="font-display-lg text-5xl text-on-background leading-tight">
            Elevate your <span className="text-primary-container">roastery</span> operations.
          </h1>
          <p className="font-body-lg text-lg text-on-surface-variant">
            Join the next generation of specialty coffee management. Gain complete visibility over your inventory, roasting curves, and wholesale orders.
          </p>
          <div className="flex gap-4 items-center pt-8 opacity-60">
            <div className="w-12 h-[1px] bg-white"></div>
            <span className="text-sm font-label-caps uppercase tracking-widest">Trusted by craft roasters</span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full max-w-md relative">
          <div className="glass-panel p-8 sm:p-10 rounded-[32px] relative overflow-hidden">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="font-headline-md text-3xl font-semibold text-on-background mb-2">Create Account</h2>
              <p className="font-body-md text-on-surface-variant">Setup your roastery in seconds.</p>
            </div>
            
            <Suspense fallback={<div className="flex justify-center items-center py-10"><Loader2 className="animate-spin text-primary-container" size={32} /></div>}>
              <RegisterForm />
            </Suspense>

            <p className="mt-8 text-center text-sm text-on-surface-variant">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-container hover:text-white font-semibold transition-colors">
                Log In
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
