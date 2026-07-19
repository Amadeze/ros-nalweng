"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  Check,
  ChevronRight,
  CircleDollarSign,
  Flame,
  Menu,
  PackageCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getCurrentDate } from "@/lib/date-utils";

const NAV_LINKS = [
  { label: "Sistem", href: "#system" },
  { label: "Alur kerja", href: "#workflow" },
  { label: "Harga", href: "#pricing" },
];

const MODULES = [
  {
    icon: Boxes,
    code: "01 / STOCK",
    title: "Inventory intelligence",
    description:
      "Setiap gram green bean, roasted bean, dan packaging bergerak dalam satu ledger yang dapat diaudit.",
    detail: "Lot · supplier · average cost · reorder point",
  },
  {
    icon: Flame,
    code: "02 / ROAST",
    title: "Production control",
    description:
      "Hubungkan batch roasting dengan yield, profil, biaya, dan output produksi—tanpa menyalin data antar sheet.",
    detail: "Batch · recipe · shrinkage · production history",
  },
  {
    icon: ShoppingBag,
    code: "03 / SELL",
    title: "B2B commerce",
    description:
      "Tenant portal bermerek sendiri, katalog wholesale, tier harga, checkout, dan rekonsiliasi pembayaran.",
    detail: "Portal · catalog · QRIS · WhatsApp checkout",
  },
  {
    icon: BarChart3,
    code: "04 / KNOW",
    title: "Financial clarity",
    description:
      "Lihat HPP, margin, piutang, payable, arus kas, serta P&L dari transaksi yang sama dengan operasional.",
    detail: "COGS · margin · P&L · audit trail",
  },
];

const WORKFLOW = [
  { step: "01", label: "Terima", detail: "Green bean & biaya pembelian masuk" },
  { step: "02", label: "Roast", detail: "Yield dan profil tercatat per batch" },
  { step: "03", label: "Pack", detail: "Output berpindah ke finished goods" },
  { step: "04", label: "Sell", detail: "Order mengurangi stok dan membentuk revenue" },
  { step: "05", label: "Read", detail: "Margin dan laporan terbentuk otomatis" },
];

const PLAN_FEATURES = [
  "Inventory ledger & purchase workflow",
  "Roasting, production, dan HPP",
  "Sales, finance, dan laporan",
  "B2B tenant storefront",
  "Multi-user role access",
  "Audit trail & operational health checks",
];

const ease = [0.16, 1, 0.3, 1] as const;

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SystemPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      <div className="absolute -inset-8 rounded-[42px] bg-[radial-gradient(circle_at_50%_40%,rgba(214,147,90,0.18),transparent_65%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#12100e]/95 shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#d6935a] shadow-[0_0_12px_rgba(214,147,90,0.8)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">Roast floor / live</span>
          </div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-300">Synced</span>
        </div>

        <div className="grid gap-px bg-white/8 md:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-[#12100e] p-5 sm:p-7">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Active batch</p>
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#f6efe8]">Gayo Natural / B-2048</h3>
              </div>
              <Flame className="h-5 w-5 text-[#d6935a]" />
            </div>

            <div className="relative h-44 overflow-hidden rounded-2xl border border-white/8 bg-[#0b0a09] p-4">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:28px_28px]" />
              <svg aria-hidden="true" viewBox="0 0 400 150" className="relative h-full w-full" fill="none">
                <path d="M0 135 C55 130 74 110 110 108 C160 104 153 70 205 68 C254 66 258 38 300 39 C345 40 360 18 400 12" stroke="rgba(214,147,90,.18)" strokeWidth="12" />
                <motion.path
                  d="M0 135 C55 130 74 110 110 108 C160 104 153 70 205 68 C254 66 258 38 300 39 C345 40 360 18 400 12"
                  stroke="#d6935a"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease }}
                />
                <path d="M0 122 C70 126 90 96 138 100 C188 104 202 78 250 82 C306 87 335 54 400 65" stroke="rgba(130,174,154,.75)" strokeWidth="1.5" strokeDasharray="5 7" />
              </svg>
              <div className="absolute bottom-3 left-4 right-4 flex justify-between font-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
                <span>Charge</span><span>Dry end</span><span>1st crack</span><span>Drop</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[{ value: "11:42", label: "Duration" }, { value: "201°C", label: "Bean temp" }, { value: "84.6%", label: "Yield" }].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
                  <p className="font-mono text-sm font-semibold text-[#f6efe8]">{item.value}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.13em] text-white/30">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#171411] p-5 sm:p-7">
            <p className="mb-5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Operational chain</p>
            <div className="space-y-3">
              {[
                { icon: Boxes, name: "Green stock", value: "248.4 kg", tone: "text-emerald-300" },
                { icon: Flame, name: "Roasting WIP", value: "12.0 kg", tone: "text-[#d6935a]" },
                { icon: PackageCheck, name: "Ready stock", value: "86 units", tone: "text-sky-300" },
                { icon: CircleDollarSign, name: "Batch margin", value: "31.8%", tone: "text-amber-200" },
              ].map((item, index) => (
                <div key={item.name} className="relative flex items-center gap-3 rounded-xl border border-white/8 bg-black/10 p-3.5">
                  {index < 3 && <span className="absolute -bottom-4 left-[25px] h-4 w-px bg-white/10" />}
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <item.icon className={`h-4 w-4 ${item.tone}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/45">{item.name}</p>
                    <p className="font-mono text-sm font-medium text-[#f6efe8]">{item.value}</p>
                  </div>
                  <BadgeCheck className="h-3.5 w-3.5 text-white/20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingClient() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#090806] text-[#f6efe8] selection:bg-[#d6935a]/30">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#090806]/82 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Roastery OS home">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6935a]/35 bg-[#d6935a]/10 font-mono text-[10px] font-bold text-[#e9aa75]">ROS</span>
            <span className="text-sm font-semibold tracking-[-0.01em] text-white">Roastery Operating System</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-white/50 transition-colors hover:text-white">{link.label}</a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link href="/login" className="text-sm font-medium text-white/55 transition-colors hover:text-white">Masuk</Link>
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-[#d6935a] px-5 py-2.5 text-sm font-semibold text-[#160f0a] transition hover:bg-[#efb27f]">
              Mulai gratis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button className="rounded-lg p-2 text-white/65 md:hidden" onClick={() => setMobileOpen((open) => !open)} aria-expanded={mobileOpen} aria-label="Buka menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/8 bg-[#0d0b09] px-5 py-5 md:hidden">
            <nav className="space-y-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-3 text-sm text-white/60 hover:bg-white/5 hover:text-white">{link.label}</a>
              ))}
              <div className="my-3 h-px bg-white/8" />
              <Link href="/login" className="block rounded-xl px-3 py-3 text-sm text-white/60">Masuk</Link>
              <Link href="/register" className="mt-2 block rounded-xl bg-[#d6935a] px-4 py-3 text-center text-sm font-semibold text-[#160f0a]">Mulai gratis</Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section className="relative px-5 pb-24 pt-36 sm:px-8 sm:pt-44 lg:pb-32">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(214,147,90,0.14),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(87,128,111,0.11),transparent_25%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:72px_72px]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.7)]" />
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">Built for Indonesian specialty roasteries</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="max-w-3xl text-[clamp(3.35rem,7vw,6.8rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-[#f7f1ea]">
                Dari green bean<br />sampai <span className="font-serif italic font-normal text-[#dca06d]">margin.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.12, ease }} className="mt-8 max-w-xl text-base leading-8 text-white/52 sm:text-lg">
                Satu sistem operasional untuk inventory, roasting, produksi, penjualan, keuangan, dan portal wholesale—dengan setiap angka terhubung ke transaksi asalnya.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.22, ease }} className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d6935a] px-7 py-3.5 text-sm font-semibold text-[#160f0a] transition hover:-translate-y-0.5 hover:bg-[#efb27f]">
                  Mulai 14 hari gratis <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#system" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 px-7 py-3.5 text-sm font-semibold text-white/75 transition hover:border-white/25 hover:bg-white/5 hover:text-white">
                  Lihat cara kerjanya <ChevronRight className="h-4 w-4" />
                </a>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.35 }} className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/35">
                {["Tanpa kartu kredit", "Tenant-ready", "Audit-friendly"].map((item) => <span key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-300/70" />{item}</span>)}
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.18, ease }}>
              <SystemPreview />
            </motion.div>
          </div>
        </section>

        <section className="border-y border-white/8 bg-[#0c0a08] px-5 py-6 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-white/30 lg:justify-between">
            <span>Inventory ledger</span><span className="text-[#d6935a]/45">→</span><span>Roast batch</span><span className="text-[#d6935a]/45">→</span><span>Finished goods</span><span className="text-[#d6935a]/45">→</span><span>Sales & payment</span><span className="text-[#d6935a]/45">→</span><span>P&amp;L</span>
          </div>
        </section>

        <section id="system" className="px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mb-14 grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
              <div>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#d6935a]">The operating layer</p>
                <h2 className="text-4xl font-semibold tracking-[-0.045em] text-[#f6efe8] sm:text-5xl">Satu sumber kebenaran.</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-white/45 md:justify-self-end">Bukan kumpulan modul yang berdiri sendiri. Setiap pembelian, roast, produksi, order, dan pembayaran membentuk satu rantai data operasional.</p>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-2">
              {MODULES.map((module, index) => (
                <Reveal key={module.code} delay={index * 0.06}>
                  <article className="group relative min-h-[290px] overflow-hidden rounded-[24px] border border-white/8 bg-[#100e0c] p-7 transition hover:border-[#d6935a]/25 sm:p-9">
                    <div className="absolute right-0 top-0 h-44 w-44 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#d6935a]/[0.055] blur-2xl transition group-hover:bg-[#d6935a]/10" />
                    <div className="relative flex h-full flex-col">
                      <div className="mb-10 flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/28">{module.code}</span>
                        <module.icon className="h-5 w-5 text-[#d6935a]" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-2xl font-semibold tracking-[-0.035em] text-[#f6efe8]">{module.title}</h3>
                      <p className="mt-4 max-w-lg text-sm leading-7 text-white/43">{module.description}</p>
                      <p className="mt-auto pt-8 font-mono text-[9px] uppercase tracking-[0.14em] text-white/25">{module.detail}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="border-y border-white/8 bg-[#0d0b09] px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <Reveal className="max-w-2xl">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300/80">Connected workflow</p>
              <h2 className="text-4xl font-semibold tracking-[-0.045em] text-[#f6efe8] sm:text-5xl">Ikuti perjalanan bean, bukan file.</h2>
              <p className="mt-5 text-base leading-7 text-white/45">Mekanisme inti tetap sederhana: catat sekali di titik kejadian, lalu biarkan sistem membawa dampaknya ke stok, biaya, dan laporan.</p>
            </Reveal>

            <div className="mt-16 grid gap-px overflow-hidden rounded-[24px] border border-white/8 bg-white/8 md:grid-cols-5">
              {WORKFLOW.map((item, index) => (
                <Reveal key={item.step} delay={index * 0.07} className="h-full">
                  <div className="relative h-full min-h-56 bg-[#12100e] p-6 sm:p-7">
                    {index < WORKFLOW.length - 1 && <ChevronRight className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 rounded-full border border-white/10 bg-[#12100e] p-1 text-[#d6935a] md:block" />}
                    <span className="font-mono text-[10px] text-[#d6935a]">{item.step}</span>
                    <h3 className="mt-16 text-xl font-semibold text-[#f6efe8]">{item.label}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/38">{item.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <Reveal>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#d6935a]">Simple pricing</p>
              <h2 className="text-4xl font-semibold tracking-[-0.045em] text-[#f6efe8] sm:text-5xl">Mulai kecil.<br />Tumbuh tanpa ganti sistem.</h2>
              <p className="mt-6 max-w-md text-base leading-7 text-white/45">Coba seluruh alur utama selama 14 hari. Tidak perlu kartu kredit dan tidak perlu memindahkan ide operasional Anda.</p>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="relative overflow-hidden rounded-[28px] border border-[#d6935a]/28 bg-[#12100e] p-7 shadow-[0_30px_100px_rgba(0,0,0,.35)] sm:p-10">
                <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#d6935a]/10 blur-3xl" />
                <div className="relative">
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d6935a]">Pro</p>
                      <p className="mt-3 text-sm text-white/40">Untuk roastery yang ingin satu operasi terhubung.</p>
                    </div>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/8 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-200">14 hari gratis</span>
                  </div>
                  <div className="my-8 h-px bg-white/8" />
                  <div className="flex items-end gap-2">
                    <span className="font-mono text-5xl font-semibold tracking-[-0.05em] text-[#f6efe8]">Rp299k</span>
                    <span className="pb-1 text-sm text-white/35">/ bulan</span>
                  </div>
                  <div className="mt-9 grid gap-3 sm:grid-cols-2">
                    {PLAN_FEATURES.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-sm leading-6 text-white/48">
                        <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/register" className="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-[#d6935a] px-7 py-4 text-sm font-semibold text-[#160f0a] transition hover:bg-[#efb27f]">
                    Mulai free trial <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-white/8 px-5 py-24 sm:px-8">
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="font-serif text-lg italic text-[#dca06d]">Roast more. Reconcile less.</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[#f6efe8] sm:text-6xl">Operasi yang rapi terasa di setiap batch.</h2>
            <Link href="/register" className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#f6efe8] px-7 py-3.5 text-sm font-semibold text-[#160f0a] transition hover:bg-white">
              Bangun sistem Anda <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-white/8 px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-sm font-semibold text-white/75">Roastery Operating System</p>
            <p className="mt-1 text-xs text-white/28">Built for the work behind every great cup.</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/35">
            <Link href="/login" className="hover:text-white">Masuk</Link>
            <Link href="/register" className="hover:text-white">Daftar</Link>
            <span>© {getCurrentDate().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
