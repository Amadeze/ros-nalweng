"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { registerTenant } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, Loader2, Coffee, Store, AtSign, Key } from "lucide-react";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();

  const [roasteryName, setRoasteryName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await registerTenant({ roasteryName, subdomain, email, password });
      if (!result.success) {
        setError(result.error);
        return;
      }
      // Pendaftaran berhasil, arahkan ke login
      router.push("/login?registered=true");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-white/90">Roastery Name</Label>
        <div className="relative">
          <Input
            type="text"
            placeholder="e.g. Senja Roastery"
            value={roasteryName}
            onChange={(e) => {
              setRoasteryName(e.target.value);
              // Auto generate subdomain if it's empty or still matches the auto-generated one
              if (!subdomain || subdomain === roasteryName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')) {
                setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
              }
            }}
            className="h-11 pl-10 text-sm bg-slate-900/50 text-slate-100 border-slate-700 focus:border-amber-500 focus:ring-amber-500 placeholder:text-slate-500"
            required
          />
          <Store size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-white/90">Portal Subdomain</Label>
        <div className="flex rounded-xl overflow-hidden border border-slate-700 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-colors bg-slate-900/50">
          <div className="pl-3 pr-2 py-3 bg-slate-800 text-slate-400 text-sm font-medium border-r border-slate-700">
            https://
          </div>
          <input
            type="text"
            placeholder="senja"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="flex-1 h-11 px-3 text-sm bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
            required
          />
          <div className="pr-3 pl-2 py-3 bg-slate-800 text-slate-400 text-sm font-medium border-l border-slate-700">
            .ros.com
          </div>
        </div>
        <p className="text-[10px] text-slate-500">Your dedicated B2B wholesale portal.</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-white/90">Email</Label>
        <div className="relative">
          <Input
            type="email"
            placeholder="admin@senjaroastery.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 pl-10 text-sm bg-slate-900/50 text-slate-100 border-slate-700 focus:border-amber-500 focus:ring-amber-500 placeholder:text-slate-500"
            required
          />
          <AtSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-white/90">Password</Label>
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 pl-10 pr-10 text-sm bg-slate-900/50 text-slate-100 border-slate-700 focus:border-amber-500 focus:ring-amber-500 placeholder:text-slate-500"
            required
          />
          <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5">
          <AlertCircle size={14} className="shrink-0 text-red-400" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
        >
          {loading ? "Creating your Roastery..." : "Start 14-Day Free Trial"}
        </Button>
      </div>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 md:p-8 bg-slate-950 relative overflow-hidden font-sans selection:bg-amber-500/30">
      {/* Decorative floating orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-[60%] -left-[10%] w-[40%] h-[60%] rounded-full bg-slate-800/40 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-2xl shadow-2xl p-8 sm:p-10">
          {/* Brand */}
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-900/20">
              <Coffee className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Create Account</h1>
              <p className="text-sm text-slate-400">Join Roastery OS and scale your business</p>
            </div>
          </div>

          <Suspense fallback={<div className="flex justify-center items-center py-4"><Loader2 className="animate-spin text-slate-500" size={24} /></div>}>
            <RegisterForm />
          </Suspense>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
