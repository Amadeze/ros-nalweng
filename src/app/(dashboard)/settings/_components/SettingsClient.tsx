"use client";

import { useEffect, useState, useRef } from "react";
import { updateTenantSettings } from "../actions";
import { toast } from "sonner";
import { toastSafe } from "@/lib/toast";
import { Tenant } from "@prisma/client";
import { Save, ExternalLink, Upload, Phone, Plus, Trash2, RotateCcw } from "lucide-react";
import { resetOnboarding } from "@/app/onboarding/actions";
import { WebhookLogModal } from "./WebhookLogsDialog";

// Helper type for tenant since Prisma Client might not have typed the new fields perfectly in this file's context if cached
type ExtendedTenant = Omit<Tenant, "midtransServerKey"> & {
  isArtisanEnabled?: boolean;
  artisanWebhookToken?: string | null;
  whatsappNumber?: string | null;
  aboutText?: string | null;
  catalogTitle?: string | null;
  catalogSubtitle?: string | null;
  footerText?: string | null;
  midtransClientKey?: string | null;
  midtransServerKeyConfigured: boolean;
  midtransIsProduction?: boolean;
  backgroundImageUrl?: string | null;
  contactEmail?: string | null;
  instagramHandle?: string | null;
  fontFamily?: string;
  themeMode?: string;
  borderRadius?: string;
  animationStyle?: string;
  animationDirection?: string;
  iconStyle?: string;
  problemStatement?: string | null;
  solutionStatement?: string | null;
  uspText?: string | null;
  features?: any | null;
  testimonials?: any | null;
  faqs?: any | null;
  setupCompletedAt?: Date | null;
};

export function SettingsClient({ tenant }: { tenant: ExtendedTenant }) {
  const portalPath = `/tenant/${tenant.subdomain}`;
  const [name, setName] = useState(tenant.name || "");
  const [timezone, setTimezone] = useState(tenant.timezone || "Asia/Jakarta");
  const [themeColor, setThemeColor] = useState(tenant.themeColor || "amber");
  const [heroText, setHeroText] = useState(tenant.heroText || "");
  const [logoUrl, setLogoUrl] = useState(tenant.logoUrl || "");
  const [heroImageUrl, setHeroImageUrl] = useState(tenant.heroImageUrl || "");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(tenant.backgroundImageUrl || "");
  const [layoutStyle, setLayoutStyle] = useState(tenant.layoutStyle || "modern");
  const [isArtisanEnabled, setIsArtisanEnabled] = useState(tenant.isArtisanEnabled || false);
  const [currentOrigin, setCurrentOrigin] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin);
    }
  }, []);
  
  // Theme Engine
  const [fontFamily, setFontFamily] = useState(tenant.fontFamily || "sans");
  const [themeMode, setThemeMode] = useState(tenant.themeMode || "light");
  const [borderRadius, setBorderRadius] = useState(tenant.borderRadius || "md");
  const [animationStyle, setAnimationStyle] = useState(tenant.animationStyle || "subtle");
  const [animationDirection, setAnimationDirection] = useState(tenant.animationDirection || "up");
  const [iconStyle, setIconStyle] = useState(tenant.iconStyle || "regular");
  
  // New Fields
  const [whatsappNumber, setWhatsappNumber] = useState(tenant.whatsappNumber || "");
  const [contactEmail, setContactEmail] = useState(tenant.contactEmail || "");
  const [instagramHandle, setInstagramHandle] = useState(tenant.instagramHandle || "");
  const [aboutText, setAboutText] = useState(tenant.aboutText || "");
  const [catalogTitle, setCatalogTitle] = useState(tenant.catalogTitle || "");
  const [catalogSubtitle, setCatalogSubtitle] = useState(tenant.catalogSubtitle || "");
  const [footerText, setFooterText] = useState(tenant.footerText || "");

  // Dynamic Landing Page Content
  const [problemStatement, setProblemStatement] = useState(tenant.problemStatement || "");
  const [solutionStatement, setSolutionStatement] = useState(tenant.solutionStatement || "");
  const [uspText, setUspText] = useState(tenant.uspText || "");
  const [features, setFeatures] = useState<any[]>(
    Array.isArray(tenant.features) ? tenant.features : []
  );
  const [testimonials, setTestimonials] = useState<any[]>(
    Array.isArray(tenant.testimonials) ? tenant.testimonials : []
  );
  const [faqs, setFaqs] = useState<any[]>(
    Array.isArray(tenant.faqs) ? tenant.faqs : []
  );

  // Payment Gateway
  const [midtransClientKey, setMidtransClientKey] = useState(tenant.midtransClientKey || "");
  const [midtransServerKey, setMidtransServerKey] = useState("");
  const [midtransIsProduction, setMidtransIsProduction] = useState(tenant.midtransIsProduction || false);
  const [isTestingMidtrans, setIsTestingMidtrans] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const [previewEnabled, setPreviewEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const syncPreview = () => setPreviewEnabled(media.matches);
    syncPreview();
    media.addEventListener("change", syncPreview);
    return () => media.removeEventListener("change", syncPreview);
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<{ logo: boolean; hero: boolean; background: boolean }>({ logo: false, hero: false, background: false });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const THEMES = [
    { id: "amber", label: "Amber", hex: "#f59e0b" },
    { id: "blue", label: "Blue", hex: "#3b82f6" },
    { id: "emerald", label: "Emerald", hex: "#10b981" },
    { id: "rose", label: "Rose", hex: "#f43f5e" },
    { id: "violet", label: "Violet", hex: "#8b5cf6" },
    { id: "zinc", label: "Zinc", hex: "#71717a" },
  ];

  const LAYOUTS = [
    { id: "heritage", label: "The Heritage Craft (Classic & Artisanal)" },
    { id: "neomodern", label: "Neo-Modernist (Sleek & Minimalist)" },
    { id: "cyber", label: "Cyber-Barista (High-Tech & Futuristic)" },
    { id: "botanical", label: "Botanical Laboratory (Organic & Eco-Friendly)" },
    { id: "editorial", label: "The Roaster's Diary (Editorial & Storytelling)" },
    { id: "liquid", label: "Liquid Symphony (Interactive & Sensory-Focused)" },
    { id: "industrial", label: "Industrial Alchemy (Gritty & Bold)" },
    { id: "club", label: "Coffee Club (Subscription & Community)" },
    { id: "luxury", label: "Luxury Reserve (Elite & Ultra-Premium)" },
    { id: "playful", label: "Playful Brew (Vibrant & Pop Art)" },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "hero" | "background") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(prev => ({ ...prev, [type]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        if (type === "logo") setLogoUrl(data.url);
        if (type === "hero") setHeroImageUrl(data.url);
        if (type === "background") setBackgroundImageUrl(data.url);
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toastSafe.error("Upload failed: " + e.message);
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const testMidtrans = async () => {
    if (!midtransServerKey && !tenant.midtransServerKeyConfigured) {
      toast.error("Please save a Server Key first.");
      return;
    }
    
    setIsTestingMidtrans(true);
    try {
      const res = await fetch("/api/settings/test-midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverKey: midtransServerKey || undefined,
          isProduction: midtransIsProduction
        })
      });
      const data = await res.json();
      if (data.success) {
        toastSafe.success(data.message);
      } else {
        toastSafe.error(data.message);
      }
    } catch (e) {
      toast.error("Failed to connect to Midtrans");
    } finally {
      setIsTestingMidtrans(false);
    }
  };

  const testWebhook = async () => {
    if (!tenant.artisanWebhookToken) return;
    setIsTestingWebhook(true);
    try {
      const res = await fetch("/api/webhooks/artisan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tenant.artisanWebhookToken}`
        },
        body: JSON.stringify({
          machine_id: "test-machine",
          event: "TEST_PING",
          timestamp: new Date().toISOString()
        })
      });
      
      if (res.ok) {
        toastSafe.success("Koneksi berhasil! Token valid dan webhook merespon dengan baik.");
      } else {
        const data = await res.json().catch(()=>({}));
        toastSafe.error("Koneksi gagal: " + (data.error || res.statusText));
      }
    } catch(e) {
      toastSafe.error("Gagal menghubungi server.");
    } finally {
      setIsTestingWebhook(false);
    }
  };

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateTenantSettings(tenant.id, {
        name,
        timezone,
        themeColor,
        heroText,
        logoUrl,
        heroImageUrl,
        layoutStyle,
        whatsappNumber,
        aboutText,
        catalogTitle,
        catalogSubtitle,
        footerText,
        midtransClientKey,
        ...(midtransServerKey ? { midtransServerKey } : {}),
        midtransIsProduction,
        isArtisanEnabled,
        backgroundImageUrl,
        contactEmail,
        instagramHandle,
        fontFamily,
        themeMode,
        borderRadius,
        animationStyle,
        animationDirection,
        iconStyle,
        problemStatement,
        solutionStatement,
        uspText,
        features: features.filter((feature) => feature.title?.trim() && feature.desc?.trim()),
        testimonials: testimonials.filter((item) => item.name?.trim() && item.text?.trim()),
        faqs: faqs.filter((item) => item.question?.trim() && item.answer?.trim()),
      });
      toast.success("Settings saved successfully!");
      setRefreshKey(prev => prev + 1);
    } catch (e: any) {
      toastSafe.error("Failed to save settings: " + (e?.message || String(e)));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid min-h-0 grid-cols-1 gap-6 xl:h-[calc(100dvh-176px)] xl:grid-cols-2">
      {/* Left Column: Form */}
      <div className="space-y-6 pb-8 xl:overflow-y-auto xl:pr-2 custom-scrollbar">
      {/* Basic Settings */}
      <div className="glass-card-static p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Roastery Identity</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Roastery Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Operational Timezone</label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
            >
              <option value="Asia/Jakarta">WIB · Asia/Jakarta</option>
              <option value="Asia/Makassar">WITA · Asia/Makassar</option>
              <option value="Asia/Jayapura">WIT · Asia/Jayapura</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">Dipakai untuk batas laporan harian, mingguan, dan bulanan.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Logo Image</label>
            <div className="flex items-center gap-4">
              {logoUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  <img src={logoUrl} alt="Logo" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex-1">
                <input 
                  type="file" 
                  ref={logoInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={e => handleFileUpload(e, "logo")}
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploading.logo}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <Upload size={16} />
                  {isUploading.logo ? "Uploading..." : "Upload Logo"}
                </button>
                <p className="text-xs text-slate-500 mt-2">Recommended: Square image, transparent PNG.</p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <Phone size={14} className="text-emerald-600" /> WhatsApp Contact (For Orders)
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              placeholder="e.g. 628123456789"
              className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
            />
            <p className="text-xs text-slate-500 mt-1">Gunakan kode negara (misal: 62) tanpa spasi atau +. Semua pesanan (checkout) tanpa payment gateway akan masuk ke nomor ini.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="hello@roastery.com"
                className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Instagram Handle</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm">@</span>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={e => setInstagramHandle(e.target.value)}
                  placeholder="roastery"
                  className="w-full rounded-r-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway */}
      <div className="glass-card-static p-6">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800">Payment Gateway (Midtrans)</h2>
          <span className="text-xs bg-blue-100 text-amber-800 px-2 py-1 rounded font-semibold">Future Ready</span>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-500 mb-4">
            Jika Midtrans Client Key dan Server Key dikosongkan, fitur keranjang B2B akan secara otomatis mengalihkan pesanan ke WhatsApp Anda. 
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Client Key</label>
              <input
                type="text"
                value={midtransClientKey}
                onChange={e => setMidtransClientKey(e.target.value)}
                placeholder="SB-Mid-client-..."
                className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Server Key (Rahasia)</label>
              <input
                type="password"
                value={midtransServerKey}
                onChange={e => setMidtransServerKey(e.target.value)}
                placeholder="SB-Mid-server-..."
                className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={midtransIsProduction} 
                onChange={(e) => setMidtransIsProduction(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-semibold text-slate-700">Production Mode</span>
            </label>

            <button 
              onClick={testMidtrans}
              disabled={isTestingMidtrans}
              className="ml-auto flex items-center gap-2 px-4 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              {isTestingMidtrans ? "Testing..." : "Test Connection"}
            </button>
          </div>
        </div>
      </div>

      {/* Integrasi Sistem - Webhook lama disembunyikan, gunakan Artisan Sync */}
      {false && (
      <div className="glass-card-static p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Integrasi Sistem (Webhook)</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-semibold text-slate-700">Aktifkan Integrasi</span>
            <input 
              type="checkbox" 
              checked={isArtisanEnabled} 
              onChange={(e) => setIsArtisanEnabled(e.target.checked)}
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
          </label>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Artisan Webhook Token</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={tenant.artisanWebhookToken || ""}
                onClick={(e) => e.currentTarget.select()}
                className="w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 text-sm text-slate-500 cursor-text"
                title="Klik untuk memilih teks"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!tenant.artisanWebhookToken) return;
                  try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      await navigator.clipboard.writeText(tenant.artisanWebhookToken);
                      toast.success("Token berhasil disalin!");
                    } else {
                      // Fallback for non-HTTPS environments
                      toastSafe.error("Gagal menyalin otomatis. Silakan blok teks (klik) dan tekan Ctrl+C");
                    }
                  } catch (err) {
                    toastSafe.error("Browser Anda memblokir fitur copy otomatis.");
                  }
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors shrink-0"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={testWebhook}
                disabled={isTestingWebhook}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs transition-colors shrink-0 disabled:opacity-50"
              >
                {isTestingWebhook ? "Testing..." : "Test Koneksi"}
              </button>
              <WebhookLogModal />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Gunakan token ini untuk menyambungkan aplikasi pihak ketiga seperti Artisan (melalui fitur Alarms/Webhook) ke sistem ini.</p>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
              Panduan Menghubungkan Artisan
            </h3>
            <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1 mb-3">
              <li>Di aplikasi Artisan, buka menu <strong>Config &gt; Alarms</strong>.</li>
              <li>Ubah kolom <strong>From</strong> menjadi <code>DROP</code>.</li>
              <li>Ubah kolom <strong>Action</strong> menjadi <code>Call Program</code> (atau <code>Command</code>/<code>App</code>).</li>
              <li>Salin kode (command) di bawah ini dan tempel di kolom <strong>Description</strong>.</li>
            </ol>
            <div className="relative">
              <textarea
                readOnly
                value={`curl.exe -X POST "${currentOrigin}/api/webhooks/artisan" -H "Authorization: Bearer ${tenant.artisanWebhookToken || "<TOKEN>"}" -H "Content-Type: application/json" -d "{\\"event\\":\\"DROP\\", \\"machine_id\\":\\"ROASTER-1\\", \\"timestamp\\":\\"%YYYY-%MM-%DD %hh:%mm:%ss\\", \\"metrics\\": {\\"duration_seconds\\": %s, \\"drop_temperature\\": %BT}}"`}
                onClick={(e) => e.currentTarget.select()}
                className="w-full text-[10px] font-mono text-slate-700 bg-slate-100 p-3 rounded-lg border border-slate-200 resize-none outline-none cursor-text"
                rows={4}
              />
              <button
                type="button"
                onClick={async () => {
                  const cmd = `curl.exe -X POST "${currentOrigin}/api/webhooks/artisan" -H "Authorization: Bearer ${tenant.artisanWebhookToken || "<TOKEN>"}" -H "Content-Type: application/json" -d "{\\"event\\":\\"DROP\\", \\"machine_id\\":\\"ROASTER-1\\", \\"timestamp\\":\\"%YYYY-%MM-%DD %hh:%mm:%ss\\", \\"metrics\\": {\\"duration_seconds\\": %s, \\"drop_temperature\\": %BT}}"`;
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(cmd);
                    toast.success("Command berhasil disalin!");
                  } else {
                    toastSafe.error("Silakan blok teks command dan tekan Ctrl+C");
                  }
                }}
                className="absolute top-2 right-2 bg-white border border-slate-200 text-slate-600 text-[10px] px-2 py-1 rounded shadow-sm hover:bg-slate-50 font-bold"
              >
                Copy Code
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-2">
              * Pastikan komputer yang menjalankan Artisan bisa mengakses <code>{currentOrigin}</code>
            </p>
          </div>
        </div>
      </div>
      )}

      {/* B2B Portal Customization */}
      <div className="glass-card-static p-6 mt-6">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800">B2B Portal Customization</h2>
          {tenant.subdomain && (
            <a 
              href={portalPath}
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              View Portal <ExternalLink size={14} />
            </a>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Visual Settings */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Visual Styles</h3>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Portal Layout Style</label>
              <select
                value={layoutStyle}
                onChange={e => setLayoutStyle(e.target.value)}
                className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              >
                {LAYOUTS.map(l => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Font Family</label>
                <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500">
                  <option value="sans">Modern (Sans)</option>
                  <option value="serif">Luxury (Serif)</option>
                  <option value="mono">Brutalist (Mono)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Theme Mode</label>
                <select value={themeMode} onChange={e => setThemeMode(e.target.value)} className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500">
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Border Radius</label>
                <select value={borderRadius} onChange={e => setBorderRadius(e.target.value)} className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500">
                  <option value="none">Sharp (0px)</option>
                  <option value="sm">Slight (4px)</option>
                  <option value="md">Rounded (8px)</option>
                  <option value="xl">Very Round (12px)</option>
                  <option value="full">Pill (99px)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Animation Style</label>
                <select value={animationStyle} onChange={e => setAnimationStyle(e.target.value)} className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500">
                  <option value="none">Static (None)</option>
                  <option value="subtle">Elegant (Subtle)</option>
                  <option value="bouncy">Playful (Bouncy)</option>
                  <option value="float">Floating (Slow)</option>
                  <option value="fast">Snappy (Fast)</option>
                  <option value="cinematic">Cinematic (Parallax 3D)</option>
                  <option value="spring">Spring Liquid</option>
                  <option value="staggered">Staggered Reveal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Animation Direction</label>
                <select value={animationDirection} onChange={e => setAnimationDirection(e.target.value)} className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500">
                  <option value="up">Fade / Slide Up</option>
                  <option value="down">Fade / Slide Down</option>
                  <option value="left">Fade / Slide Left</option>
                  <option value="right">Fade / Slide Right</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Icon Style</label>
                <select value={iconStyle} onChange={e => setIconStyle(e.target.value)} className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500">
                  <option value="thin">Thin</option>
                  <option value="light">Light</option>
                  <option value="regular">Regular</option>
                  <option value="bold">Bold</option>
                  <option value="fill">Fill (Solid Blok)</option>
                  <option value="duotone">Duotone (Dua Warna)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Theme Color</label>
              <div className="flex flex-wrap gap-4">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setThemeColor(theme.id)}
                    className={`flex flex-col items-center gap-2 transition-transform ${themeColor === theme.id ? "scale-110" : "opacity-70 hover:opacity-100"}`}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full shadow-md ${themeColor === theme.id ? "ring-2 ring-offset-2 ring-slate-800" : ""}`}
                      style={{ backgroundColor: theme.hex }}
                    />
                    <span className="text-xs font-semibold text-slate-600">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Background Image</label>
              <div className="flex flex-col gap-3">
                {heroImageUrl && (
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 shadow-sm flex items-center justify-center relative group">
                    <img src={heroImageUrl} alt="Hero" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button onClick={() => setHeroImageUrl("")} className="text-white text-xs font-bold bg-red-500 px-3 py-1 rounded">Remove</button>
                    </div>
                  </div>
                )}
                <div>
                  <input 
                    type="file" 
                    ref={heroInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={e => handleFileUpload(e, "hero")}
                  />
                  <button
                    onClick={() => heroInputRef.current?.click()}
                    disabled={isUploading.hero}
                    className="flex items-center justify-center w-full gap-2 rounded-xl border border-dashed border-slate-300 bg-white/50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    <Upload size={16} />
                    {isUploading.hero ? "Uploading..." : "Upload Hero Image"}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Background / Pattern Image</label>
              <div className="flex flex-col gap-3">
                {backgroundImageUrl && (
                  <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 shadow-sm flex items-center justify-center relative group">
                    <img src={backgroundImageUrl} alt="Background" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button onClick={() => setBackgroundImageUrl("")} className="text-white text-xs font-bold bg-red-500 px-3 py-1 rounded">Remove</button>
                    </div>
                  </div>
                )}
                <div>
                  <input 
                    type="file" 
                    ref={backgroundInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={e => handleFileUpload(e, "background")}
                  />
                  <button
                    onClick={() => backgroundInputRef.current?.click()}
                    disabled={isUploading.background}
                    className="flex items-center justify-center w-full gap-2 rounded-xl border border-dashed border-slate-300 bg-white/50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    <Upload size={16} />
                    {isUploading.background ? "Uploading..." : "Upload Background"}
                  </button>
                  <p className="text-xs text-slate-500 mt-2 text-center">Akan digunakan sebagai corak latar belakang Portal (opsional).</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Text Settings */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Portal Texts</h3>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Text (Title)</label>
              <textarea
                value={heroText}
                onChange={e => setHeroText(e.target.value)}
                placeholder="Premium Coffee Beans, Roasted for Your Business."
                rows={2}
                className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">About Text</label>
              <textarea
                value={aboutText}
                onChange={e => setAboutText(e.target.value)}
                placeholder="Welcome to our official wholesale portal. We provide..."
                rows={3}
                className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Catalog Title</label>
                <input
                  type="text"
                  value={catalogTitle}
                  onChange={e => setCatalogTitle(e.target.value)}
                  placeholder="The Collection"
                  className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Catalog Subtitle</label>
                <input
                  type="text"
                  value={catalogSubtitle}
                  onChange={e => setCatalogSubtitle(e.target.value)}
                  placeholder="Meticulously profiled..."
                  className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Footer Text</label>
              <input
                type="text"
                value={footerText}
                onChange={e => setFooterText(e.target.value)}
                placeholder="All rights reserved."
                className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Landing Page Content */}
      <div className="glass-card-static p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Landing Page Content (Dynamic)</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Problem Statement</label>
            <textarea
              value={problemStatement}
              onChange={e => setProblemStatement(e.target.value)}
              placeholder="What problem does your product solve for your customers?"
              rows={2}
              className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Solution Statement</label>
            <textarea
              value={solutionStatement}
              onChange={e => setSolutionStatement(e.target.value)}
              placeholder="How do you solve their problem?"
              rows={2}
              className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Unique Selling Proposition (Why Choose Us)</label>
            <textarea
              value={uspText}
              onChange={e => setUspText(e.target.value)}
              placeholder="Why are you the best choice?"
              rows={2}
              className="w-full rounded-xl border-slate-200 bg-white/50 px-4 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">Features & Benefits</h3>
              <button 
                onClick={() => setFeatures([...features, { title: "", desc: "", iconName: "Star" }])}
                className="text-xs flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-200 font-semibold"
              ><Plus size={12}/> Add Feature</button>
            </div>
            <div className="space-y-3">
              {features.map((f, i) => (
                <div key={i} className="flex gap-2 items-start bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div className="flex-1 space-y-2">
                    <input type="text" value={f.title || ""} onChange={e => { const n = [...features]; n[i].title = e.target.value; setFeatures(n); }} placeholder="Feature Title" className="w-full rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm" />
                    <textarea value={f.desc || ""} onChange={e => { const n = [...features]; n[i].desc = e.target.value; setFeatures(n); }} placeholder="Description" rows={2} className="w-full rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm" />
                    <input type="text" value={f.iconName || ""} onChange={e => { const n = [...features]; n[i].iconName = e.target.value; setFeatures(n); }} placeholder="Lucide Icon Name (e.g., Zap, Star, Shield)" className="w-full rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm" />
                  </div>
                  <button onClick={() => setFeatures(features.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16}/></button>
                </div>
              ))}
              {features.length === 0 && <p className="text-xs text-slate-500">No features added. Will use template default.</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">Testimonials</h3>
              <button 
                onClick={() => setTestimonials([...testimonials, { name: "", role: "", text: "", rating: 5 }])}
                className="text-xs flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-200 font-semibold"
              ><Plus size={12}/> Add Testimonial</button>
            </div>
            <div className="space-y-3">
              {testimonials.map((t, i) => (
                <div key={i} className="flex gap-2 items-start bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={t.name || ""} onChange={e => { const n = [...testimonials]; n[i].name = e.target.value; setTestimonials(n); }} placeholder="Customer Name" className="w-full rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm" />
                      <input type="text" value={t.role || ""} onChange={e => { const n = [...testimonials]; n[i].role = e.target.value; setTestimonials(n); }} placeholder="Role (e.g., Cafe Owner)" className="w-full rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm" />
                    </div>
                    <textarea value={t.text || ""} onChange={e => { const n = [...testimonials]; n[i].text = e.target.value; setTestimonials(n); }} placeholder="Review text" rows={2} className="w-full rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm" />
                    <input type="number" min="1" max="5" value={t.rating || 5} onChange={e => { const n = [...testimonials]; n[i].rating = parseInt(e.target.value); setTestimonials(n); }} placeholder="Rating (1-5)" className="w-full rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm" />
                  </div>
                  <button onClick={() => setTestimonials(testimonials.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16}/></button>
                </div>
              ))}
              {testimonials.length === 0 && <p className="text-xs text-slate-500">No testimonials added. Will use template default.</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">Frequently Asked Questions (FAQ)</h3>
              <button 
                onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
                className="text-xs flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-200 font-semibold"
              ><Plus size={12}/> Add FAQ</button>
            </div>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={i} className="flex gap-2 items-start bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div className="flex-1 space-y-2">
                    <input type="text" value={f.question || ""} onChange={e => { const n = [...faqs]; n[i].question = e.target.value; setFaqs(n); }} placeholder="Question" className="w-full rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold" />
                    <textarea value={f.answer || ""} onChange={e => { const n = [...faqs]; n[i].answer = e.target.value; setFaqs(n); }} placeholder="Answer" rows={2} className="w-full rounded-lg border-slate-200 bg-white px-3 py-1.5 text-sm" />
                  </div>
                  <button onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16}/></button>
                </div>
              ))}
              {faqs.length === 0 && <p className="text-xs text-slate-500">No FAQs added. Will use template default.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-amber-950 shadow-lg shadow-amber-500/30 transition-all hover:bg-amber-400 disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {tenant.setupCompletedAt && (
        <div className="col-span-1 xl:col-span-2 border-t border-red-100 pt-6">
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5">
            <h3 className="text-sm font-bold text-red-900">Zona Berbahaya</h3>
            <p className="mt-1 text-xs text-red-700">
              Reset onboarding akan menghapus semua progres panduan awal dan mengembalikan Anda ke langkah pertama. Data operasional (supplier, produk, stok, resep, pelanggan) tidak akan dihapus.
            </p>
            <button
              type="button"
              onClick={async () => {
                if (!confirm("Yakin ingin mengulangi panduan awal? Anda akan diarahkan ke /onboarding.")) return;
                const res = await resetOnboarding();
                if (res.success) {
                  toast.success("Panduan awal direset. Mengalihkan...");
                  setTimeout(() => { window.location.href = "/onboarding"; }, 1000);
                } else {
                  toastSafe.error("Gagal reset panduan awal.");
                }
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-700 shadow-sm transition-colors hover:bg-red-50"
            >
              <RotateCcw size={14} />
              Ulangi Panduan Awal
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Right Column: Live Preview */}
      <div className="hidden xl:flex flex-col bg-slate-100 rounded-3xl border-4 border-slate-200 shadow-xl overflow-hidden relative">
        {/* Browser Top Bar */}
        <div className="bg-slate-200 text-slate-500 py-2.5 px-4 text-xs font-mono flex items-center justify-center gap-2 relative border-b border-slate-300">
          <span className="absolute left-4 flex gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
          </span>
          <span className="bg-white px-6 py-1 rounded-full shadow-sm flex items-center gap-2">
            <span className="text-slate-400">🔒</span>
            {portalPath}
          </span>
        </div>
        
        {/* Iframe */}
        <div className="flex-1 bg-white relative">
          {previewEnabled ? (
            <iframe
              key={refreshKey}
              src={portalPath}
              loading="lazy"
              className="w-full h-full border-none"
              title="Live Preview"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
