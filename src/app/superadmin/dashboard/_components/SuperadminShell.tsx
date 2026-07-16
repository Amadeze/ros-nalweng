"use client";

import { motion } from "framer-motion";
import { Users, DollarSign, TrendingUp, Building2, ShieldCheck, Activity } from "lucide-react";
import { TenantGrowthChart } from "./TenantGrowthChart";
import { RecentTenants } from "./RecentTenants";

interface SuperadminData {
  totalTenants: number;
  activeTenants: number;
  newTenantsThisMonth: number;
  mrr: number;
  totalGmv: number;
  growthData: any[];
  recentTenants: any[];
}

function KpiCard({ label, value, sub, icon, isAmber = false }: { label: string, value: string, sub: string, icon: React.ReactNode, isAmber?: boolean }) {
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} 
      className={`relative overflow-hidden flex flex-col gap-4 rounded-3xl border ${isAmber ? 'border-primary-container/40 bg-primary-container/10' : 'border-white/5 bg-surface/40'} p-6 shadow-xl backdrop-blur-2xl transition-all hover:bg-white/5 hover:shadow-2xl`}
    >
      <div className="flex items-start justify-between relative z-10">
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest leading-none">
          {label}
        </p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-inner border ${isAmber ? 'border-primary-container/50 bg-primary-container/20 text-primary-container' : 'border-white/10 bg-white/5 text-white'}`}>
          {icon}
        </span>
      </div>
      <div className="relative z-10">
        <p className={`font-headline-md text-3xl font-bold tabular-nums leading-none ${isAmber ? 'text-primary-container' : 'text-white'}`}>
          {value}
        </p>
        <div className="mt-2 text-xs font-medium text-on-surface-variant/70">{sub}</div>
      </div>
      
      {/* Decorative Glow */}
      {isAmber && (
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />
      )}
    </motion.div>
  );
}

export function SuperadminShell({ data }: { data: SuperadminData }) {
  return (
    <div className="flex h-full flex-col overflow-hidden text-on-background">
      {/* Header */}
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/5 bg-surface/30 px-8 backdrop-blur-2xl">
        <div>
          <h1 className="font-headline-md text-2xl font-bold tracking-tight text-white">System Overview</h1>
          <p className="mt-1 text-xs font-medium text-on-surface-variant">Manage your SaaS platform metrics and growth.</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 space-y-8">
        
        {/* KPI Cards */}
        <motion.div 
          initial="hidden" 
          animate="show" 
          variants={{ show: { transition: { staggerChildren: 0.1 } } }} 
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          <KpiCard
            label="Est. Monthly Revenue (MRR)"
            value={`$${data.mrr.toLocaleString()}`}
            sub="Based on active subscriptions"
            icon={<DollarSign size={20} />}
            isAmber={true}
          />
          <KpiCard
            label="Total Platform GMV"
            value={`Rp ${(data.totalGmv / 1000000).toFixed(1)}M`}
            sub="Gross merchandise value across all tenants"
            icon={<TrendingUp size={20} />}
          />
          <KpiCard
            label="Active Tenants"
            value={`${data.activeTenants} / ${data.totalTenants}`}
            sub="Merchants currently active"
            icon={<ShieldCheck size={20} />}
          />
          <KpiCard
            label="New Signups"
            value={`+${data.newTenantsThisMonth}`}
            sub="New merchants this month"
            icon={<Users size={20} />}
          />
        </motion.div>

        {/* Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-full rounded-3xl border border-white/5 bg-surface/40 p-6 backdrop-blur-2xl shadow-xl flex flex-col">
              <div className="mb-6">
                <h3 className="font-headline-md text-lg font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-primary-container" /> Tenant Growth
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">Number of registered roasteries over the last 6 months.</p>
              </div>
              <div className="flex-1 min-h-[300px]">
                <TenantGrowthChart data={data.growthData} />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="h-full rounded-3xl border border-white/5 bg-surface/40 p-6 backdrop-blur-2xl shadow-xl flex flex-col">
              <div className="mb-6">
                <h3 className="font-headline-md text-lg font-bold text-white flex items-center gap-2">
                  <Building2 size={18} className="text-primary-container" /> Recent Signups
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">Latest outlets to join the platform.</p>
              </div>
              <div className="flex-1">
                <RecentTenants tenants={data.recentTenants} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
