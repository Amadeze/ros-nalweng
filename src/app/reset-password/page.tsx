"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "./actions";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmation) {
      setMessage("Konfirmasi password tidak sama.");
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(token, password);
      setSuccess(result.success);
      setMessage(result.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-md border border-slate-800 bg-slate-900 p-8 shadow-2xl">
      <KeyRound className="mb-5 text-amber-400" size={32} />
      <h1 className="text-2xl font-bold text-white">Buat password baru</h1>
      <p className="mt-2 text-sm text-slate-400">Gunakan minimal 8 karakter.</p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-200">Password baru</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={success}
            className="border-slate-700 bg-slate-950 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmation" className="text-slate-200">Konfirmasi password</Label>
          <Input
            id="confirmation"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            required
            disabled={success}
            className="border-slate-700 bg-slate-950 text-white"
          />
        </div>
        {message && (
          <p className="border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
            {message}
          </p>
        )}
        {!success && (
          <Button type="submit" disabled={loading || !token} className="w-full">
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Perbarui password"}
          </Button>
        )}
      </form>

      <Link href="/login" className="mt-6 block text-sm font-medium text-amber-400">
        Kembali ke login
      </Link>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-950 p-4">
      <Suspense fallback={<div className="text-sm text-slate-400">Memuat...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
