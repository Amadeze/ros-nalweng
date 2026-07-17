"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, Loader2, Coffee } from "lucide-react";
import Link from "next/link";

// 1. PISAHKAN LOGIKA FORM KE KOMPONEN TERSENDIRI
function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const requestedFrom = searchParams.get("from");
  const from =
    requestedFrom?.startsWith("/") && !requestedFrom.startsWith("//")
      ? requestedFrom
      : "/dashboard";

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginAction(email, password);
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (result.role === "SUPERADMIN") {
        router.push("/superadmin");
      } else {
        router.push(from);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-white/90">Email</Label>
        <Input
          type="email"
          autoComplete="email"
          placeholder="admin@roasteryos.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 text-sm bg-slate-900/50 text-slate-100 border-slate-700 focus:border-amber-500 focus:ring-amber-500 placeholder:text-slate-500"
          required
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-white/90">Password</Label>
          <Link href="/forgot-password" className="text-xs font-medium text-amber-400 hover:text-amber-300">
            Lupa password?
          </Link>
        </div>
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 pr-10 text-sm bg-slate-900/50 text-slate-100 border-slate-700 focus:border-amber-500 focus:ring-amber-500 placeholder:text-slate-500"
            required
          />
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
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5">
          <AlertCircle size={14} className="shrink-0 text-red-500" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20"
      >
        {loading ? "Masuk..." : "Masuk"}
      </Button>
    </form>
  );
}

// 2. HALAMAN UTAMA YANG MEMBUNGKUS FORM DENGAN SUSPENSE
export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 md:p-8 bg-slate-950 relative overflow-hidden font-sans selection:bg-amber-500/30">
      {/* Decorative floating orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-slate-800/40 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-2xl shadow-2xl p-8 sm:p-10">
          {/* Brand */}
          <div className="mb-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-900/20">
              <Coffee className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Welcome back</h1>
              <p className="text-sm text-slate-400">Sign in to your Roastery OS workspace</p>
            </div>
          </div>

          {/* Form dibungkus Suspense agar lolos build Next.js */}
          <Suspense fallback={
            <div className="flex justify-center items-center py-4">
              <Loader2 className="animate-spin text-slate-500" size={24} />
            </div>
          }>
            <LoginForm />
          </Suspense>

          <div className="mt-8 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 text-center">
              <span className="font-semibold text-slate-300">Demo Access:</span><br/>
              admin@beanslab.com / admin123
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Roastery OS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
