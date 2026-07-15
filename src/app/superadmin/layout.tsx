import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SESSION_OPTIONS, type SessionUser } from "@/lib/session";
import { LayoutDashboard, Users, LogOut, Coffee } from "lucide-react";
import { logoutAction } from "@/app/login/actions";

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
    <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-950 font-sans text-slate-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900/50 flex flex-col">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">System Admin</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Roastery OS</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/superadmin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
            <LayoutDashboard size={18} />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
          <Link href="/superadmin/tenants" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
            <Users size={18} />
            <span className="font-medium text-sm">Tenants (Outlets)</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950">
        {children}
      </main>
    </div>
  );
}
