"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

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
        <Label className="text-xs font-medium text-zinc-700">Email</Label>
        <Input
          type="email"
          autoComplete="email"
          placeholder="admin@nalweng.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 text-sm"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Password</Label>
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 pr-10 text-sm"
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
        className="w-full h-10 bg-[#0f2b38] hover:bg-[#1a3f52] text-white font-medium rounded-xl"
      >
        {loading ? "Masuk..." : "Masuk"}
      </Button>
    </form>
  );
}

// 2. HALAMAN UTAMA YANG MEMBUNGKUS FORM DENGAN SUSPENSE
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-[2rem] border border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/60 p-8">
          {/* Brand */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0f2b38] shadow-lg">
              <Coffee size={24} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Nalweng Roastery</h1>
              <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-widest">Operating System</p>
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

          <p className="mt-6 text-center text-[11px] text-zinc-400">
            ROS · Nalweng Roastery · v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
