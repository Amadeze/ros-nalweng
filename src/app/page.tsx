import { LandingClient } from "./LandingClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roastery OS | ERP Khusus Coffee Roastery",
  description: "Tinggalkan pencatatan manual di Excel & kekacauan order via WhatsApp. Satu platform terpusat untuk mengelola stok Green Bean, Roasting Log, hingga pesanan Wholesale otomatis.",
  openGraph: {
    title: "Roastery OS | ERP Khusus Coffee Roastery",
    description: "Satu platform terpusat untuk mengelola stok Green Bean, Roasting Log, hingga pesanan Wholesale otomatis.",
    type: "website",
    locale: "id_ID",
  },
};

export default function LandingPage() {
  return <LandingClient />;
}
