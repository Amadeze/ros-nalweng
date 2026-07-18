"use client";

import { useState, useEffect } from "react";
import { Tenant } from "@prisma/client";
import { CreditCard, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import Script from "next/script";
import { toast } from "sonner";
import { PLAN_CATALOG } from "@/lib/plans";

export default function BillingClient({ tenant }: { tenant: Tenant }) {
  const isTrial = tenant.subscriptionTier === "TRIAL";
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  
  // Calculate remaining days if trial
  let daysRemaining = 0;
  if (isTrial && tenant.trialEndsAt) {
    const diffTime = new Date(tenant.trialEndsAt).getTime() - Date.now();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const isExpired = isTrial && daysRemaining <= 0;

  const handleSubscribe = async (tier: string) => {
    try {
      setLoadingTier(tier);
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal membuat transaksi");

      // Midtrans Snap
      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: function (result: any) {
            toast.success("Pembayaran berhasil! Mengupdate akun Anda...");
            setTimeout(() => window.location.reload(), 2000);
          },
          onPending: function (result: any) {
            toast.info("Menunggu pembayaran Anda.");
          },
          onError: function (result: any) {
            toast.error("Pembayaran gagal!");
          },
          onClose: function () {
            toast.error("Pembayaran dibatalkan.");
          }
        });
      } else {
        toast.error("Sistem pembayaran belum siap, coba sesaat lagi.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <>
      <Script 
        src={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.includes("sandbox") ? "https://app.sandbox.midtrans.com/snap/snap.js" : "https://app.midtrans.com/snap/snap.js"} 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} 
        strategy="lazyOnload" 
      />

      <div className="flex-1 overflow-auto bg-slate-50/50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Subscription & Billing</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your Roastery OS plan and billing details.</p>
          </header>

          {/* Current Plan Status */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {tenant.subscriptionTier} PLAN
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${tenant.subscriptionStatus === 'ACTIVE' && !isExpired ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {isExpired ? 'EXPIRED' : tenant.subscriptionStatus}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">
                  {isTrial ? "14-Day Free Trial" : `Roastery OS ${tenant.subscriptionTier}`}
                </h2>
                {isTrial ? (
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    {isExpired ? (
                      <><AlertTriangle size={16} className="text-red-500"/> Your trial has expired. Upgrade to continue using all features.</>
                    ) : (
                      <><Clock size={16} className="text-amber-500"/> {daysRemaining} days remaining in your trial.</>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Next billing date: {tenant.nextBillingDate ? new Date(tenant.nextBillingDate).toLocaleDateString() : 'N/A'}
                  </p>
                )}
              </div>

              {tenant.subscriptionTier !== "TRIAL" && (
                <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors">
                  Manage Billing
                </button>
              )}
            </div>
          </div>

          {/* Upgrade Options */}
          {tenant.subscriptionTier !== "PRO" && (
            <div className="mt-12">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Upgrade your plan</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {tenant.subscriptionTier === "TRIAL" && (
                  <div className="border border-slate-200 bg-white p-6 shadow-sm">
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Roastery OS Basic</h4>
                    <div className="mb-4">
                      <span className="text-3xl font-extrabold text-slate-900">{formatRupiah(PLAN_CATALOG.BASIC.monthlyPrice)}</span>
                      <span className="text-slate-500 text-sm">/mo</span>
                    </div>
                    <ul className="mb-8 mt-6 space-y-3">
                      <li className="text-slate-600 text-sm flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Inventory, roasting, production, sales</li>
                      <li className="text-slate-600 text-sm flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Tenant storefront</li>
                      <li className="text-slate-600 text-sm flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> PDF and Excel exports</li>
                    </ul>
                    <button
                      onClick={() => handleSubscribe("BASIC")}
                      disabled={loadingTier !== null}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      {loadingTier === "BASIC" ? "Processing..." : <><CreditCard size={18} /> Subscribe to Basic</>}
                    </button>
                  </div>
                )}
                
                <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Premium Access</div>
                  <h4 className="text-lg font-bold text-amber-700 mb-2">Roastery OS Pro</h4>
                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-slate-900">{formatRupiah(PLAN_CATALOG.PRO.monthlyPrice)}</span>
                    <span className="text-slate-500 text-sm">/mo</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mb-8 mt-6">
                    <ul className="space-y-3">
                      <li className="text-slate-600 text-sm flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Core Inventory & Ledger</li>
                      <li className="text-slate-600 text-sm flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Roasting & Production Logs</li>
                      <li className="text-slate-600 text-sm flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Advanced B2B Portal</li>
                    </ul>
                    <ul className="space-y-3">
                      <li className="text-slate-600 text-sm flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Custom Domain</li>
                      <li className="text-slate-600 text-sm flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Payment Gateway (Midtrans)</li>
                      <li className="text-slate-600 text-sm flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> Advanced Analytics & P&L</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleSubscribe("PRO")}
                    disabled={loadingTier !== null}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {loadingTier === "PRO" ? "Processing..." : <><CreditCard size={18} /> Subscribe to Pro</>}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
