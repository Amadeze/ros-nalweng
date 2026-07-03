import { Sidebar } from "@/components/layout/Sidebar";

/**
 * AppShell — root shell untuk semua halaman autentikasi.
 * Dipakai di app/(dashboard)/layout.tsx agar sidebar hanya muncul
 * di halaman yang memerlukan autentikasi, bukan di halaman login.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen gap-4 overflow-hidden p-4">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-2xl backdrop-blur-xl">
        {children}
      </main>
    </div>
  );
}
