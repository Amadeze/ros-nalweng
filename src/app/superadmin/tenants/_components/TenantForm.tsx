"use client";

import { useState } from "react";
import { createTenant } from "../actions";
import { toast } from "sonner";
import { Plus, X, Server, User as UserIcon, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TenantForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createTenant({ code, name, subdomain, adminName, adminEmail });
      if (res.success) {
        toast.success(
          res.emailSent
            ? "Outlet berhasil dibuat. Tautan pembuatan password telah dikirim ke owner."
            : "Outlet berhasil dibuat. Konfigurasi email belum aktif; owner dapat memakai fitur lupa password setelah email diaktifkan.",
        );
        setIsOpen(false);
        setCode("");
        setName("");
        setSubdomain("");
        setAdminName("");
        setAdminEmail("");
      } else {
        toast.error(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)} 
        className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20"
      >
        <Plus size={18} /> New Outlet
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server size={20} className="text-amber-500" /> Register New Outlet
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
              <Server size={14} /> Outlet Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Outlet Code</label>
                <input 
                  type="text" required value={code} onChange={e => setCode(e.target.value)}
                  placeholder="e.g. NAL-001"
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 text-white placeholder:text-slate-600 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Outlet Name</label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="Beanslab Roastery"
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 text-white placeholder:text-slate-600 outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Subdomain</label>
              <div className="flex">
                <input 
                  type="text" required value={subdomain} onChange={e => setSubdomain(e.target.value)}
                  placeholder="beanslab"
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-800 border-r-0 rounded-l-xl text-sm focus:border-amber-500 text-white placeholder:text-slate-600 outline-none"
                />
                <div className="h-10 px-4 bg-slate-900 border border-slate-800 rounded-r-xl flex items-center text-sm text-slate-500 font-medium">
                  .localhost:3000
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2 mt-2">
              <UserIcon size={14} /> Owner Details
            </h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Admin Name</label>
              <input 
                type="text" required value={adminName} onChange={e => setAdminName(e.target.value)}
                placeholder="Budi Santoso"
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 text-white placeholder:text-slate-600 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Admin Email</label>
              <input 
                type="email" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                placeholder="budi@beanslab.com"
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 text-white placeholder:text-slate-600 outline-none"
              />
            </div>
            <p className="text-xs text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 font-medium">
              Owner akan menerima tautan aman untuk membuat password pertama. Tautan berlaku selama 24 jam.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" onClick={() => setIsOpen(false)} variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-6">
              {loading ? "Creating..." : "Create Outlet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
