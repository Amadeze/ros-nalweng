"use client";

import { motion } from "framer-motion";
import { Coffee, ExternalLink } from "lucide-react";

export function RecentTenants({ tenants }: { tenants: any[] }) {
  if (tenants.length === 0) {
    return <p className="text-sm text-on-surface-variant">No tenants found.</p>;
  }

  return (
    <div className="space-y-4">
      {tenants.map((tenant, idx) => (
        <motion.div 
          key={tenant.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface border border-white/10 flex items-center justify-center shrink-0">
              <Coffee size={16} className="text-primary-container" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{tenant.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary-container bg-primary-container/10 px-1.5 rounded-sm">
                  {tenant.tier}
                </span>
                <span className="text-xs text-on-surface-variant font-mono">{tenant.subdomain}</span>
              </div>
            </div>
          </div>
          <a 
            href={`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/tenant/${tenant.subdomain}`} 
            target="_blank" rel="noreferrer"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        </motion.div>
      ))}
    </div>
  );
}
