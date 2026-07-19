import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  ChevronRight,
  CircleDollarSign,
  Flame,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Workflow,
} from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Cara kerja", href: "#workflow" },
  { label: "Fitur", href: "#system" },
  { label: "Harga", href: "#pricing" },
];

const MODULES = [
  {
    icon: Boxes,
    eyebrow: "Stok",
    title: "Stok yang selalu terhubung",
    description: "Green bean, roasted bean, dan kemasan bergerak otomatis dari transaksi asalnya.",
    detail: "Lot, supplier, average cost, reorder point",
  },
  {
    icon: Flame,
    eyebrow: "Produksi",
    title: "Batch yang lebih konsisten",
    description: "Hubungkan green bean, roast level, yield, biaya, dan hasil produksi dalam satu alur.",
    detail: "Batch, recipe, shrinkage, production history",
  },
  {
    icon: ShoppingBag,
    eyebrow: "Penjualan",
    title: "Order B2B tanpa kerja ulang",
    description: "Katalog wholesale, tier harga, checkout, dan pembayaran terhubung langsung ke operasional.",
    detail: "Portal, katalog, QRIS, WhatsApp checkout",
  },
  {
    icon: BarChart3,
    eyebrow: "Laporan",
    title: "Margin yang benar-benar terlihat",
    description: "Pantau HPP, margin, piutang, kas, dan laba rugi dari transaksi yang sama.",
    detail: "COGS, margin, P&L, audit trail",
  },
];

const WORKFLOW = [
  { step: "01", label: "Beli", detail: "Green bean dan biaya pembelian masuk" },
  { step: "02", label: "Roast", detail: "Profil, yield, dan hasil tercatat per batch" },
  { step: "03", label: "Pack", detail: "Output berpindah ke finished goods" },
  { step: "04", label: "Jual", detail: "Order mengurangi stok dan mencatat revenue" },
  { step: "05", label: "Pantau", detail: "Margin dan laporan terbentuk otomatis" },
];

const PLAN_FEATURES = [
  "Inventory ledger dan purchase workflow",
  "Roasting, produksi, dan HPP",
  "Sales, finance, dan laporan",
  "B2B tenant storefront",
  "Multi-user role access",
  "Audit trail dan health checks",
];

function BrandMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2a211b] font-mono text-[10px] font-bold tracking-wide text-[#f4b27d]">
      ROS
    </span>
  );
}

function SystemPreview() {
  const operationalChain = [
    { icon: Boxes, name: "Green stock", value: "248.4 kg", tone: "bg-emerald-50 text-emerald-700" },
    { icon: Flame, name: "Roasting WIP", value: "12.0 kg", tone: "bg-orange-50 text-orange-700" },
    { icon: PackageCheck, name: "Ready stock", value: "86 unit", tone: "bg-sky-50 text-sky-700" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#ded8d1] bg-white shadow-[0_24px_70px_rgba(55,42,31,0.12)]">
      <div className="flex items-center justify-between border-b border-[#ece7e1] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-[#51473f]">Operasional hari ini</span>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Live
        </span>
      </div>

      <div className="grid md:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-[#ece7e1] p-5 sm:p-6 md:border-b-0 md:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a8d82]">Active roast</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#211a16]">Gayo Natural</h3>
              <p className="mt-1 text-xs text-[#81746a]">Batch B-2048</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff2e7] text-[#b9602d]">
              <Flame className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-7 flex h-28 items-end gap-2 rounded-xl bg-[#f7f4f0] px-4 pb-4 pt-6" aria-label="Roast profile preview">
            {[22, 30, 38, 49, 58, 70, 82, 92].map((height, index) => (
              <span
                key={height}
                className={`flex-1 rounded-t-sm ${index === 7 ? "bg-[#b9602d]" : "bg-[#dcc4b2]"}`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { value: "11:42", label: "Durasi" },
              { value: "201°C", label: "Suhu" },
              { value: "84.6%", label: "Yield" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#ece7e1] px-3 py-3">
                <p className="text-sm font-bold text-[#211a16]">{item.value}</p>
                <p className="mt-1 text-[10px] text-[#9a8d82]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#fcfbf9] p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a8d82]">Alur stok</p>
          <div className="mt-5 space-y-3">
            {operationalChain.map((item) => (
              <div key={item.name} className="flex items-center gap-3 rounded-xl border border-[#ece7e1] bg-white p-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.tone}`}>
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#81746a]">{item.name}</p>
                  <p className="mt-0.5 text-sm font-bold text-[#211a16]">{item.value}</p>
                </div>
                <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-[#2a211b] p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-white/55">Estimasi margin batch</p>
                <p className="mt-1 text-xl font-semibold">31.8%</p>
              </div>
              <CircleDollarSign className="h-5 w-5 text-[#f4b27d]" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingClient() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f5f1] text-[#211a16] selection:bg-[#efc5a5]">
      <header className="sticky top-0 z-50 border-b border-[#e6e0d9] bg-[#f7f5f1]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Roastery OS home">
            <BrandMark />
            <span className="text-sm font-semibold tracking-tight">Roastery OS</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Navigasi utama">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-[#6f6258] transition-colors hover:text-[#211a16]">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link href="/login" className="text-sm font-semibold text-[#6f6258] transition-colors hover:text-[#211a16]">
              Masuk
            </Link>
            <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-[#2a211b] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#43362d]">
              Mulai gratis <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <Link href="/register" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#2a211b] px-4 py-2 text-sm font-semibold text-white md:hidden">
            Mulai <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main>
        <section className="px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#ded8d1] bg-white px-3 py-1.5 text-xs font-semibold text-[#6f6258]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Dibuat untuk roastery Indonesia
              </div>
              <h1 className="max-w-2xl text-[clamp(3rem,6.3vw,6rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-[#211a16]">
                Operasional roastery, dibuat lebih sederhana.
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#6f6258] sm:text-lg sm:leading-8">
                Catat sekali. Stok, roasting, HPP, penjualan, pembayaran, dan laporan bergerak otomatis dalam satu sistem yang cepat dan mudah dipahami.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#b9602d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a45125]">
                  Mulai 14 hari gratis <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a href="#workflow" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d6cfc7] bg-white px-6 py-3 text-sm font-semibold text-[#51473f] transition-colors hover:border-[#bcb2a8]">
                  Lihat cara kerja <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#81746a]">
                {["Untuk tim kecil", "Tanpa setup rumit", "Data real-time"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />{item}
                  </span>
                ))}
              </div>
            </div>
            <SystemPreview />
          </div>
        </section>

        <section className="border-y border-[#e6e0d9] bg-white px-5 py-7 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 text-sm font-semibold text-[#51473f] sm:grid-cols-3">
            <div className="flex items-center gap-3"><Workflow className="h-5 w-5 text-[#b9602d]" aria-hidden="true" /> Satu input, semua proses terhubung</div>
            <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#b9602d]" aria-hidden="true" /> Guardrail mencegah salah input</div>
            <div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-[#b9602d]" aria-hidden="true" /> Laporan mengikuti transaksi nyata</div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9602d]">Cara kerja</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Alur yang mengikuti pekerjaan tim Anda.</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-[#6f6258] lg:justify-self-end">
                Tidak perlu menguasai sistem yang rumit. Setiap aktivitas harian memperbarui stok, biaya, dan laporan secara otomatis.
              </p>
            </div>

            <ol className="mt-12 grid overflow-hidden rounded-2xl border border-[#ded8d1] bg-white md:grid-cols-5">
              {WORKFLOW.map((item, index) => (
                <li key={item.step} className={`min-h-48 p-6 ${index < WORKFLOW.length - 1 ? "border-b border-[#e6e0d9] md:border-b-0 md:border-r" : ""}`}>
                  <span className="text-xs font-bold text-[#b9602d]">{item.step}</span>
                  <h3 className="mt-8 text-lg font-semibold">{item.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#81746a]">{item.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="system" className="scroll-mt-20 border-y border-[#e6e0d9] bg-[#efebe5] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9602d]">Satu sistem</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Semua yang penting. Tanpa keramaian.</h2>
              <p className="mt-5 text-base leading-7 text-[#6f6258]">Empat area kerja terhubung, dengan tampilan yang tetap fokus pada tugas hari ini.</p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {MODULES.map((module) => (
                <article key={module.eyebrow} className="rounded-2xl border border-[#ded8d1] bg-white p-7 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9602d]">{module.eyebrow}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f3ee] text-[#51473f]">
                      <module.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold tracking-tight">{module.title}</h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-[#6f6258]">{module.description}</p>
                  <p className="mt-7 border-t border-[#ece7e1] pt-5 text-xs text-[#9a8d82]">{module.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9602d]">Harga sederhana</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Mulai dari yang dibutuhkan sekarang.</h2>
              <p className="mt-5 text-base leading-7 text-[#6f6258]">Satu paket inti untuk operasional harian. Fitur lanjutan dapat mengikuti pertumbuhan roastery Anda.</p>
            </div>

            <div className="rounded-2xl bg-[#2a211b] p-7 text-white sm:p-9">
              <div className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f4b27d]">Roastery OS Core</p>
                  <p className="mt-3 text-sm text-white/60">Untuk tim yang ingin berhenti mengulang pekerjaan.</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-4xl font-semibold tracking-tight">Rp299rb</p>
                  <p className="mt-1 text-xs text-white/45">per bulan · per roastery</p>
                </div>
              </div>
              <div className="grid gap-x-8 gap-y-3 py-7 sm:grid-cols-2">
                {PLAN_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-white/72">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />{feature}
                  </div>
                ))}
              </div>
              <Link href="/register" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f4b27d] px-6 py-3 text-sm font-semibold text-[#2a211b] transition-colors hover:bg-[#ffc79b]">
                Coba gratis 14 hari <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e6e0d9] bg-white px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9602d]">Siap digunakan</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Lebih sedikit admin. Lebih banyak roasting.</h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#6f6258]">Mulai dari aktivitas harian tim. Sistem akan menjaga proses berikutnya tetap terhubung.</p>
            <Link href="/register" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#2a211b] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#43362d]">
              Mulai sekarang <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e6e0d9] bg-[#f7f5f1] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-[#81746a] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><BrandMark /><span>Roastery Operating System</span></div>
          <p>Built for the people behind every roast.</p>
        </div>
      </footer>
    </div>
  );
}
