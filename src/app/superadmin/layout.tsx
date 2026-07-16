import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SESSION_OPTIONS, type SessionUser } from "@/lib/session";
import { LayoutDashboard, Users, LogOut, Coffee } from "lucide-react";
import { logoutAction } from "@/app/login/actions";

import { ShaderBackground } from "@/components/ShaderBackground";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getIronSession<{ user?: SessionUser }>(await cookies(), SESSION_OPTIONS);
  
  if (!session.user || session.user.role !== "SUPERADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-deep-obsidian font-body-lg text-on-background dark relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-20 mix-blend-screen pointer-events-none">
        <ShaderBackground />
      </div>

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-surface/50 backdrop-blur-2xl flex flex-col z-10">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Coffee className="w-5 h-5 text-amber-950" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-headline-md font-bold text-white tracking-tight leading-none">Superadmin</h1>
            <p className="text-[10px] font-label-caps uppercase tracking-widest text-primary-container mt-1">Roastery OS</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/superadmin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-on-surface-variant hover:text-white transition-all group">
            <LayoutDashboard size={18} className="group-hover:text-primary-container transition-colors" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
          <Link href="/superadmin/tenants" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-on-surface-variant hover:text-white transition-all group">
            <Users size={18} className="group-hover:text-primary-container transition-colors" />
            <span className="font-medium text-sm">Tenants (Outlets)</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-error/10 text-on-surface-variant hover:text-error transition-all"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-transparent z-10 relative">
        {children}
      </main>
    </div>
  );
}
