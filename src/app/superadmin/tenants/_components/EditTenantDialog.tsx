"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Edit2, X, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateTenantAdmin } from "../actions";
import type { Tenant, SubscriptionTier, SubscriptionStatus } from "@prisma/client";

interface EditTenantDialogProps {
  tenant: Pick<Tenant, "id" | "name" | "code" | "isActive" | "subscriptionTier" | "subscriptionStatus">;
}

export function EditTenantDialog({ tenant }: EditTenantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isActive, setIsActive] = useState(tenant.isActive);
  const [tier, setTier] = useState<SubscriptionTier>(tenant.subscriptionTier);
  const [status, setStatus] = useState<SubscriptionStatus>(tenant.subscriptionStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateTenantAdmin({ 
        id: tenant.id, 
        isActive, 
        subscriptionTier: tier, 
        subscriptionStatus: status 
      });
      if (res.success) {
        toast.success(`Outlet ${tenant.name} updated successfully!`);
        setIsOpen(false);
      } else {
        toast.error(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        title="Edit Tenant"
      >
        <Edit2 size={16} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings2 size={20} className="text-amber-500" /> Edit Outlet
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-white">{tenant.name}</p>
              <p className="text-xs text-slate-500 font-mono">{tenant.code}</p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-300">Account Status</label>
              <select 
                value={isActive ? "true" : "false"} 
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 text-white outline-none"
              >
                <option value="true">Active</option>
                <option value="false">Inactive / Suspended</option>
              </select>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-300">Subscription Tier</label>
              <select 
                value={tier} 
                onChange={(e) => setTier(e.target.value as SubscriptionTier)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 text-white outline-none"
              >
                <option value="TRIAL">Trial</option>
                <option value="BASIC">Basic (Starter)</option>
                <option value="PRO">Pro (Professional)</option>
                <option value="ENTERPRISE">Enterprise (Scale)</option>
              </select>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-300">Subscription Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                className="w-full h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:border-amber-500 text-white outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="PAST_DUE">Past Due</option>
                <option value="CANCELED">Canceled</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
            
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" onClick={() => setIsOpen(false)} variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-6">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
