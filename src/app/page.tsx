import { LandingClient } from "./LandingClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roastery OS | Operasional Otomatis untuk Coffee Roastery",
  description: "Catat sekali, lalu stok, HPP, roasting, produksi, penjualan, pembayaran, dan laporan bergerak otomatis dalam satu sistem yang cepat dan real-time.",
  openGraph: {
    title: "Roastery OS | Dari Green Bean sampai Margin",
    description: "Sistem operasional roastery yang cepat, otomatis, anti-human-error, dan real-time.",
    type: "website",
    locale: "id_ID",
  },
};

export default function LandingPage() {
  return <LandingClient />;
}
