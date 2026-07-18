"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  type Transition,
} from "framer-motion";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ShaderBackground } from "@/components/ShaderBackground";
import { getCurrentDate } from "@/lib/date-utils";

/* ─── helpers ─── */
function useCountUp(end: number, duration = 2000) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const val = useMotionValue(0);
  const rounded = useTransform(val, (v) => Math.round(v).toLocaleString("id-ID"));
  useEffect(() => {
    if (isInView) animate(val, end, { duration: duration / 1000 });
  }, [isInView, end, duration, val]);
  useEffect(() => {
    const unsub = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsub;
  }, [rounded]);
  return ref;
}

/* ─── animation configs ─── */
const EASE = [0.16, 1, 0.3, 1] as Transition["ease"];

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: EASE },
};

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-60px" },
  transition: { staggerChildren: 0.1 },
};

/* ─── data ─── */
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

const FEATURES = [
  {
    title: "Inventory Intelligence",
    desc: "Track every gram of green bean from origin to roast. Automatic shrinkage calculation, real-time COGS, and batch-level cost attribution. Know your true cost before you sell a single bag.",
    visual: "grid" as const,
  },
  {
    title: "Production Pipeline",
    desc: "From green bean intake to roasted output. Log roasting sessions, track yield percentages, and maintain recipe consistency across every batch. Your roast profile history, always accessible.",
    visual: "lines" as const,
  },
  {
    title: "Financial Clarity",
    desc: "Profit margin per kilogram, real-time P&L, and expense tracking. No more spreadsheets. No more guessing. Every number has a source, every source is auditable.",
    visual: "peaks" as const,
  },
  {
    title: "B2B Commerce",
    desc: "Give each wholesale client their own ordering portal. They order online, you fulfill. QRIS and bank transfer via Midtrans, auto-reconciliation. Zero WhatsApp chaos.",
    visual: "nodes" as const,
  },
];

const STEPS = [
  {
    num: "01",
    title: "Connect",
    desc: "Import your inventory data, supplier list, and customer roster. We handle the heavy lifting.",
  },
  {
    num: "02",
    title: "Configure",
    desc: "Set up roasting recipes, pricing tiers, and portal access. Everything is customizable.",
  },
  {
    num: "03",
    title: "Commerce",
    desc: "Your clients order, payments reconcile, and your P&L updates in real time.",
  },
];

const TESTIMONIALS = [
  {
    quote: "The cost transparency alone paid for itself in the first month. We finally know exactly what each kilogram costs us to produce.",
    name: "Budi Santoso",
    role: "Founder, Kopi Nusantara",
  },
  {
    quote: "Our wholesale clients love the ordering portal. No more missed WhatsApp messages, no more order errors. Everything is transparent.",
    name: "Rina Wijaya",
    role: "Operations, Daily Brews",
  },
  {
    quote: "I went from spending three days on month-end accounting to about two hours. The P&L reports are exactly what I needed.",
    name: "Andi Pratama",
    role: "Owner, RoastMaster Jakarta",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "14-day trial",
    desc: "Everything you need to get started.",
    features: [
      "Green bean inventory",
      "Roasting log & COGS",
      "Basic sales reports",
      "1 admin user",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Rp 299k",
    period: "/month",
    desc: "For roasteries ready to scale.",
    features: [
      "Everything in Starter",
      "B2B ordering portal",
      "Payment gateway (QRIS/Transfer)",
      "Automated P&L reports",
      "Multi-user access",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
];

/* ─── abstract visuals for features ─── */
function FeatureVisual({ type }: { type: "grid" | "lines" | "peaks" | "nodes" }) {
  if (type === "grid") {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="grid grid-cols-4 gap-1.5 w-full max-w-[180px]">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.15 + Math.random() * 0.45 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: EASE }}
              className="aspect-square rounded-sm"
              style={{ backgroundColor: i === 5 || i === 9 || i === 14 ? "#c8956c" : "#fafafa" }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === "lines") {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.line
              key={i}
              x1="0"
              y1={20 + i * 22}
              x2="200"
              y2={20 + i * 22}
              stroke={i === 2 ? "#c8956c" : "#fafafa"}
              strokeWidth="1"
              opacity={i === 2 ? 0.5 : 0.08}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: i * 0.1, ease: EASE }}
            />
          ))}
          <motion.circle
            cx="140"
            cy="62"
            r="4"
            fill="#c8956c"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.8 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          />
        </svg>
      </div>
    );
  }

  if (type === "peaks") {
    const points = "0,100 20,60 40,80 60,30 80,70 100,20 120,50 140,10 160,40 180,25 200,60";
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <svg viewBox="0 0 200 110" className="w-full max-w-[220px]">
          <motion.polyline
            points={points}
            fill="none"
            stroke="#c8956c"
            strokeWidth="1.5"
            opacity="0.5"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: EASE }}
          />
          <motion.polyline
            points={points}
            fill="none"
            stroke="#fafafa"
            strokeWidth="0.5"
            opacity="0.08"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.2, ease: EASE }}
          />
        </svg>
      </div>
    );
  }

  /* nodes */
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <svg viewBox="0 0 200 140" className="w-full max-w-[220px]">
        {[
          { cx: 40, cy: 40 },
          { cx: 100, cy: 30 },
          { cx: 160, cy: 50 },
          { cx: 60, cy: 100 },
          { cx: 140, cy: 110 },
        ].map((p, i) => (
          <motion.circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r={i === 2 ? 5 : 3}
            fill={i === 2 ? "#c8956c" : "#fafafa"}
            opacity={i === 2 ? 0.7 : 0.15}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: EASE }}
          />
        ))}
        {[
          [40, 40, 100, 30],
          [100, 30, 160, 50],
          [40, 40, 60, 100],
          [160, 50, 140, 110],
          [60, 100, 140, 110],
        ].map(([x1, y1, x2, y2], i) => (
          <motion.line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#fafafa"
            strokeWidth="0.5"
            opacity="0.08"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: EASE }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ─── component ─── */
export function LandingClient() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  /* scroll detection for nav */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* testimonial rotation */
  useEffect(() => {
    const id = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  /* counters */
  const c1 = useCountUp(500);
  const c2 = useCountUp(10000);
  const c3 = useCountUp(99, 1500);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{
        backgroundColor: "#0a0a0a",
        color: "#a0a0a0",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ─── 1. NAVIGATION ─── */}
      <header
        className="fixed top-0 w-full z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? "rgba(10,10,10,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        }}
      >
        <div className="flex justify-between items-center h-[72px] px-6 max-w-6xl mx-auto">
          <Link href="/" className="text-lg font-bold tracking-tight" style={{ color: "#fafafa", fontFamily: "'Inter Tight', 'DM Sans', sans-serif" }}>
            Roastery<span style={{ color: "#c8956c" }}>.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm transition-colors duration-300"
                style={{ color: "#a0a0a0" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fafafa")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#a0a0a0")}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/login"
              className="text-sm font-medium transition-colors duration-300"
              style={{ color: "#a0a0a0" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fafafa")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#a0a0a0")}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-5 py-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: "#c8956c",
                color: "#0a0a0a",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0b08a")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c8956c")}
            >
              Start Building
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="1.5">
              {mobileOpen ? (
                <path d="M6 6L18 18M6 18L18 6" />
              ) : (
                <path d="M4 8h16M4 16h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden px-6 pb-6"
            style={{ backgroundColor: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)" }}
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-base transition-colors"
                style={{ color: "#a0a0a0" }}
              >
                {l.label}
              </a>
            ))}
            <div className="h-px my-3" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-3 text-base" style={{ color: "#a0a0a0" }}>
              Log in
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="block py-3 mt-1 text-center text-sm font-semibold rounded-xl"
              style={{ backgroundColor: "#c8956c", color: "#0a0a0a" }}
            >
              Start Building
            </Link>
          </motion.div>
        )}
      </header>

      {/* ─── 2. HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
        {/* subtle shader behind everything */}
        <div className="absolute inset-0 z-0 opacity-[0.07]" style={{ mixBlendMode: "screen" }}>
          <ShaderBackground />
        </div>

        {/* thin horizontal rule */}
        <div
          className="absolute top-[55%] left-0 w-full h-px z-0"
          style={{ background: "linear-gradient(90deg, transparent 0%, rgba(200,149,108,0.12) 50%, transparent 100%)" }}
        />

        <div className="max-w-5xl mx-auto z-10 w-full text-center relative">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="leading-[0.95] tracking-[-0.04em] mb-6"
            style={{
              fontFamily: "'Inter Tight', 'DM Sans', sans-serif",
              fontWeight: 700,
              color: "#fafafa",
              fontSize: "clamp(48px, 10vw, 120px)",
            }}
          >
            Roastery
            <br />
            Operating System
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
            className="max-w-xl mx-auto leading-relaxed"
            style={{ color: "#a0a0a0", fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.7 }}
          >
            The infrastructure layer for specialty coffee businesses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#c8956c", color: "#0a0a0a" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0b08a")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c8956c")}
            >
              Start Building
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center"
              style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#fafafa" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
            >
              View Documentation
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── 3. METRICS BAR ─── */}
      <section className="py-16 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {[
            { ref: c1, suffix: "+", label: "roasteries" },
            { ref: c2, suffix: "+", label: "transactions" },
            { value: "99.9", suffix: "%", label: "uptime" },
            { value: "50", suffix: "B+", label: "Rp processed", isStatic: true },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
              className="text-center"
            >
              <div
                className="mb-2"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#fafafa", fontSize: "clamp(28px, 4vw, 42px)" }}
              >
                {s.isStatic ? (
                  <span>{s.value}{s.suffix}</span>
                ) : s.ref ? (
                  <>
                    <span ref={s.ref as React.RefObject<HTMLSpanElement>} />
                    {s.suffix}
                  </>
                ) : null}
              </div>
              <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "rgba(160,160,160,0.6)" }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 4. FEATURE SHOWCASE ─── */}
      <section id="features" className="relative z-10">
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className="min-h-screen flex items-center px-6 py-24"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div className={`max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}>
              {/* text side */}
              <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: EASE }}
                className="[direction:ltr]"
              >
                <div className="text-xs uppercase tracking-[0.25em] mb-6" style={{ color: "#c8956c" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h2
                  className="mb-6"
                  style={{
                    fontFamily: "'Inter Tight', 'DM Sans', sans-serif",
                    fontWeight: 700,
                    color: "#fafafa",
                    fontSize: "clamp(32px, 5vw, 52px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {f.title}
                </h2>
                <p className="max-w-md" style={{ color: "#a0a0a0", lineHeight: 1.7, fontSize: "clamp(15px, 1.5vw, 17px)" }}>
                  {f.desc}
                </p>
              </motion.div>

              {/* visual side */}
              <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
                className="aspect-square md:aspect-[4/3] rounded-lg overflow-hidden flex items-center justify-center [direction:ltr]"
                style={{ backgroundColor: "#141414", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <FeatureVisual type={f.visual} />
              </motion.div>
            </div>
          </div>
        ))}
      </section>

      {/* ─── 5. HOW IT WORKS ─── */}
      <section id="how-it-works" className="px-6 py-32" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-24">
            <div className="text-xs uppercase tracking-[0.25em] mb-4" style={{ color: "#c8956c" }}>
              Process
            </div>
            <h2
              style={{
                fontFamily: "'Inter Tight', 'DM Sans', sans-serif",
                fontWeight: 700,
                color: "#fafafa",
                fontSize: "clamp(32px, 5vw, 52px)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              How It Works
            </h2>
          </motion.div>

          <div className="relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-[32px] left-[16.6%] right-[16.6%] h-px" style={{ backgroundColor: "rgba(200,149,108,0.15)" }}>
              <motion.div
                className="h-full"
                style={{ backgroundColor: "#c8956c" }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: EASE }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.15, ease: EASE }}
                  className="text-center relative"
                >
                  <div
                    className="mb-6 inline-block"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      fontSize: "64px",
                      lineHeight: 1,
                      color: "rgba(200,149,108,0.12)",
                    }}
                  >
                    {s.num}
                  </div>
                  <h3
                    className="mb-3"
                    style={{
                      fontFamily: "'Inter Tight', 'DM Sans', sans-serif",
                      fontWeight: 700,
                      color: "#fafafa",
                      fontSize: "20px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {s.title}
                  </h3>
                  <p style={{ color: "#a0a0a0", lineHeight: 1.7, fontSize: "15px", maxWidth: "280px", margin: "0 auto" }}>
                    {s.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. TESTIMONIALS ─── */}
      <section className="px-6 py-32" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", backgroundColor: "#0d0d0d" }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <div className="text-xs uppercase tracking-[0.25em] mb-16" style={{ color: "#c8956c" }}>
              Trusted by Roasteries
            </div>

            <div className="min-h-[200px] flex items-center justify-center">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    opacity: testimonialIdx === i ? 1 : 0,
                    y: testimonialIdx === i ? 0 : 20,
                  }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ display: testimonialIdx === i ? "flex" : "none" }}
                >
                  <p
                    className="mb-8 max-w-2xl"
                    style={{
                      fontFamily: "'Inter Tight', 'DM Sans', sans-serif",
                      fontWeight: 400,
                      color: "#fafafa",
                      fontSize: "clamp(20px, 3vw, 30px)",
                      lineHeight: 1.4,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#fafafa" }}>
                      {t.name}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#a0a0a0" }}>
                      {t.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* dots */}
            <div className="flex items-center justify-center gap-2 mt-12">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: testimonialIdx === i ? "#c8956c" : "rgba(160,160,160,0.2)",
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 7. PRICING ─── */}
      <section id="pricing" className="px-6 py-32" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-20">
            <div className="text-xs uppercase tracking-[0.25em] mb-4" style={{ color: "#c8956c" }}>
              Pricing
            </div>
            <h2
              style={{
                fontFamily: "'Inter Tight', 'DM Sans', sans-serif",
                fontWeight: 700,
                color: "#fafafa",
                fontSize: "clamp(32px, 5vw, 52px)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              Simple. Transparent.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {PLANS.map((p) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: EASE }}
                className="flex flex-col gap-6 rounded-2xl p-8 md:p-10 transition-all duration-300"
                style={{
                  backgroundColor: "#141414",
                  border: p.highlighted ? "1px solid rgba(200,149,108,0.3)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <h3
                    className="mb-1"
                    style={{
                      fontFamily: "'Inter Tight', 'DM Sans', sans-serif",
                      fontWeight: 700,
                      color: "#fafafa",
                      fontSize: "20px",
                    }}
                  >
                    {p.name}
                  </h3>
                  <p className="text-sm" style={{ color: "#a0a0a0" }}>
                    {p.desc}
                  </p>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      color: "#fafafa",
                      fontSize: p.price === "Free" ? "48px" : "40px",
                    }}
                  >
                    {p.price}
                  </span>
                  {p.period && (
                    <span className="text-sm" style={{ color: "#a0a0a0" }}>
                      {p.period}
                    </span>
                  )}
                </div>

                <div className="h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />

                <ul className="flex flex-col gap-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "#a0a0a0" }}>
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#c8956c" }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-4">
                  <Link
                    href="/register"
                    className="block w-full text-center py-3 rounded-full text-sm font-semibold transition-all duration-300"
                    style={
                      p.highlighted
                        ? { backgroundColor: "#c8956c", color: "#0a0a0a" }
                        : { border: "1px solid rgba(255,255,255,0.1)", color: "#fafafa" }
                    }
                    onMouseEnter={(e) => {
                      if (p.highlighted) e.currentTarget.style.backgroundColor = "#e0b08a";
                      else e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      if (p.highlighted) e.currentTarget.style.backgroundColor = "#c8956c";
                      else e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {p.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. CTA SECTION ─── */}
      <section className="px-6 py-32 relative" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        {/* subtle grain texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center relative z-10">
          <h2
            className="mb-8"
            style={{
              fontFamily: "'Inter Tight', 'DM Sans', sans-serif",
              fontWeight: 700,
              color: "#fafafa",
              fontSize: "clamp(32px, 5vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Ready to modernize
            <br />
            your roastery?
          </h2>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-sm font-semibold transition-all duration-300"
            style={{ backgroundColor: "#c8956c", color: "#0a0a0a" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0b08a")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c8956c")}
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-xs" style={{ color: "rgba(160,160,160,0.5)" }}>
            No credit card required. 14-day trial.
          </p>
        </motion.div>
      </section>

      {/* ─── 9. FOOTER ─── */}
      <footer className="px-6 py-12" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="text-base font-bold tracking-tight" style={{ color: "#fafafa", fontFamily: "'Inter Tight', 'DM Sans', sans-serif" }}>
            Roastery<span style={{ color: "#c8956c" }}>.</span>
          </Link>

          <div className="flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-xs transition-colors duration-300"
                style={{ color: "#a0a0a0" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fafafa")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#a0a0a0")}
              >
                {l.label}
              </a>
            ))}
          </div>

          <p className="text-xs" style={{ color: "rgba(160,160,160,0.4)" }}>
            &copy; {getCurrentDate().getFullYear()} Roastery OS
          </p>
        </div>
      </footer>
    </div>
  );
}
