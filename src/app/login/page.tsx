"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import logoImg from "../../../public/logo.png";

// 1. PISAHKAN LOGIKA FORM KE KOMPONEN TERSENDIRI
function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get("from") ?? "/dashboard";

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
      router.push(from);
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
          placeholder="admin@nalweng.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 text-sm bg-white text-slate-900 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-white/90">Password</Label>
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 pr-10 text-sm bg-white text-slate-900 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
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
        className="w-full h-11 bg-white/20 hover:bg-white/30 border border-white/20 text-white font-semibold rounded-xl backdrop-blur-md transition-all shadow-lg"
      >
        {loading ? "Masuk..." : "Masuk"}
      </Button>
    </form>
  );
}

// 2. HALAMAN UTAMA YANG MEMBUNGKUS FORM DENGAN SUSPENSE
export default function LoginPage() {
  return (
    <div 
      className="min-h-[100dvh] w-full flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
      style={{
        background: "linear-gradient(-45deg, #0f2b38, #164e63, #1e3a8a, #0f172a)",
        backgroundSize: "400% 400%",
        animation: "gradient-xy 15s ease infinite",
      }}
    >
      {/* Decorative floating orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-teal-500/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-indigo-500/20 blur-[100px]" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Card */}
        <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl p-8">
          {/* Brand */}
          <div className="mb-10 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center bg-white/10 p-4 rounded-2xl border border-white/10 shadow-inner">
              <Image src={logoImg} alt="Nalweng Logo" className="h-16 w-auto object-contain drop-shadow-lg scale-110 brightness-0 invert" priority />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-white/80 uppercase tracking-widest">Operating System</p>
            </div>
          </div>

          {/* Form dibungkus Suspense agar lolos build Next.js */}
          <Suspense fallback={
            <div className="flex justify-center items-center py-4">
              <Loader2 className="animate-spin text-zinc-400" size={24} />
            </div>
          }>
            <LoginForm />
          </Suspense>

          <p className="mt-8 text-center text-[11px] text-white/40">
            ROS · Nalweng Roastery · v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
