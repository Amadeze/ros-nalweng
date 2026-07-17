import type { Metadata, Viewport } from "next"; // <-- Tambahkan Viewport di sini
import {
  DM_Sans,
  EB_Garamond,
  Geist,
  Geist_Mono,
  Inter,
  JetBrains_Mono,
  Nunito,
  Orbitron,
  Playfair_Display,
  Source_Serif_4,
  Space_Grotesk,
  Space_Mono,
} from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  preload: false,
});
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  preload: false,
});
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  preload: false,
});
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  preload: false,
});
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  preload: false,
});
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  preload: false,
});
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  preload: false,
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  preload: false,
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
});
const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  preload: false,
});

const storefrontFonts = [
  playfairDisplay.variable,
  jetBrainsMono.variable,
  orbitron.variable,
  dmSans.variable,
  sourceSerif.variable,
  nunito.variable,
  spaceMono.variable,
  spaceGrotesk.variable,
  inter.variable,
  ebGaramond.variable,
].join(" ");

export const metadata: Metadata = {
  title: "Roastery OS - Beanslab",
  description: "Roastery Operating System by Beanslab Roastery",
};

// 👇 Tambahkan blok kode viewport ini 👇
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${storefrontFonts} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
