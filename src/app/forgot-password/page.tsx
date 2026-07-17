"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-950 p-4">
      <section className="w-full max-w-md border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <KeyRound className="mb-5 text-amber-400" size={32} />
        <h1 className="text-2xl font-bold text-white">Lupa password</h1>
        <p className="mt-2 text-sm text-slate-400">
          Masukkan email akun. Tautan reset berlaku selama 30 menit.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="border-slate-700 bg-slate-950 text-white"
            />
          </div>
          {message && (
            <p className="border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
              {message}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Kirim tautan reset"}
          </Button>
        </form>

        <Link href="/login" className="mt-6 block text-sm font-medium text-amber-400">
          Kembali ke login
        </Link>
      </section>
    </main>
  );
}
