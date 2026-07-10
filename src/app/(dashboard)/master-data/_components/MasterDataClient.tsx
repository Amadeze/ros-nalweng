"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Plus, Building2, Users, Package, CheckCircle2, XCircle, Pencil, UserCog, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { StandardDrawer } from "@/components/StandardDrawer";
import { Button } from "@/components/ui/button";
import { SupplierForm } from "./SupplierForm";
import { CustomerForm } from "./CustomerForm";
import { ProductForm } from "./ProductForm";
import { PackagingForm } from "./PackagingForm";
import { UserForm } from "./UserForm";
import type { MasterPageData, SupplierRow, CustomerRow, ProductRow, UserRow, PackagingRow } from "../actions";

interface MasterDataClientProps {
  data: MasterPageData;
  userRole: string;
}

// =============================================================================
// Tab definition
// =============================================================================

type Tab = "supplier" | "pelanggan" | "produk" | "kemasan" | "pengguna";

const ALL_TABS: { id: Tab; label: string; icon: React.ElementType; count: (d: MasterPageData) => number }[] = [
  { id: "supplier",  label: "Supplier",  icon: Building2, count: (d) => d.suppliers.length },
  { id: "pelanggan", label: "Pelanggan", icon: Users,     count: (d) => d.customers.length },
  { id: "produk",    label: "Produk",    icon: Package,   count: (d) => d.products.length  },
  { id: "kemasan",   label: "Kemasan",   icon: Package,   count: (d) => d.packagings.length },
  { id: "pengguna",  label: "Pengguna",  icon: UserCog,   count: (d) => d.users.length     },
];

function getTabsForRole(role: string) {
  if (role === "OWNER" || role === "MANAGER") return ALL_TABS;
  if (role === "CASHIER") return ALL_TABS.filter(t => t.id === "produk" || t.id === "pelanggan");
  if (role === "OPERATOR") return ALL_TABS.filter(t => t.id === "supplier" || t.id === "pelanggan" || t.id === "produk" || t.id === "kemasan");
  return ALL_TABS.filter(t => t.id === "produk"); // fallback
}

// =============================================================================
// Product type helpers
// =============================================================================

const PROD_TYPE_LABEL: Record<ProductRow["type"], string> = {
  GREEN_BEAN:     "GB",
  ROASTED_BEAN:   "RB",
  FINISHED_GOODS: "FG",
  PACKAGING:      "PKG",
};
const PROD_TYPE_COLOR: Record<ProductRow["type"], string> = {
  GREEN_BEAN:     "bg-lime-100 text-lime-700",
  ROASTED_BEAN:   "bg-amber-100 text-amber-700",
  FINISHED_GOODS: "bg-violet-100 text-violet-700",
  PACKAGING:      "bg-orange-100 text-orange-700",
};
const PROD_TYPE_FULL: Record<ProductRow["type"], string> = {
  GREEN_BEAN:     "Green Bean",
  ROASTED_BEAN:   "Roasted Bean",
  FINISHED_GOODS: "Finished Goods",
  PACKAGING:      "Packaging",
};

// =============================================================================
// Shared helpers
// =============================================================================

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl shadow-lg shadow-slate-200/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/50 text-slate-400 shadow-sm border border-white/60">
        <Package size={24} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-600">Belum ada {label}</p>
        <p className="mt-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Klik "Tambah" untuk membuat</p>
      </div>
    </div>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return active
    ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow-sm border border-emerald-100"><CheckCircle2 size={9} strokeWidth={3} />Aktif</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/10 px-2 py-0.5 text-[10px] font-bold text-slate-500 shadow-sm border border-slate-200"><XCircle size={9} strokeWidth={3} />Nonaktif</span>;
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="inline-flex items-center gap-1 rounded-lg border border-white/60 bg-white/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 transition-all hover:border-white hover:bg-white hover:text-slate-900 hover:shadow-md hover:scale-105"
    >
      <Pencil size={10} strokeWidth={3} /> Edit
    </button>
  );
}

const ROLE_BADGE_CLASS: Record<UserRow["role"], string> = {
  OWNER: "bg-rose-100 text-rose-700",
  MANAGER: "bg-sky-100 text-sky-700",
  OPERATOR: "bg-amber-100 text-amber-700",
  CASHIER: "bg-violet-100 text-violet-700",
};

function RoleBadge({ role }: { role: UserRow["role"] }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_BADGE_CLASS[role]}`}>
      {role}
    </span>
  );
}

// =============================================================================
// Supplier Table
// =============================================================================

function SupplierTable({ rows, onEdit }: { rows: SupplierRow[]; onEdit: (r: SupplierRow) => void }) {
  if (rows.length === 0) return <EmptyState label="supplier" />;
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl shadow-lg shadow-slate-200/30">
      <table className="w-full text-sm">
        <thead className="border-b border-white/50 bg-white/40 backdrop-blur-md">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden md:table-cell">No. Telp</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden lg:table-cell">Wilayah</th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Beli</th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/30">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-white/40 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800">{row.name}</p>
                {row.address && <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{row.address}</p>}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{row.phone ?? "—"}</td>
              <td className="px-4 py-3 hidden lg:table-cell">
                {row.region
                  ? <span className="rounded-full bg-slate-900/10 px-2 py-0.5 text-[10px] font-medium text-slate-700">{row.region}</span>
                  : <span className="text-xs text-slate-400">—</span>}
              </td>
              <td className="px-4 py-3 text-center font-mono text-xs font-semibold text-slate-700">{row.purchaseCount}×</td>
              <td className="px-4 py-3 text-center"><ActiveBadge active={row.isActive} /></td>
              <td className="px-4 py-3 text-center"><EditButton onClick={() => onEdit(row)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// Customer Table
// =============================================================================

function CustomerTable({ rows, onEdit }: { rows: CustomerRow[]; onEdit: (r: CustomerRow) => void }) {
  if (rows.length === 0) return <EmptyState label="pelanggan" />;
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl shadow-lg shadow-slate-200/30">
      <table className="w-full text-sm">
        <thead className="border-b border-white/50 bg-white/40 backdrop-blur-md">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden md:table-cell">No. Telp</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden lg:table-cell">Email</th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Nota</th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/30">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-white/40 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800">{row.name}</p>
                {row.address && <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{row.address}</p>}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{row.phone ?? "—"}</td>
              <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">{row.email ?? "—"}</td>
              <td className="px-4 py-3 text-center font-mono text-xs font-semibold text-slate-700">{row.invoiceCount}×</td>
              <td className="px-4 py-3 text-center"><ActiveBadge active={row.isActive} /></td>
              <td className="px-4 py-3 text-center"><EditButton onClick={() => onEdit(row)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// Product Table
// =============================================================================

function ProductTable({ rows, onEdit }: { rows: ProductRow[]; onEdit: (r: ProductRow) => void }) {
  if (rows.length === 0) return <EmptyState label="produk" />;
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl shadow-lg shadow-slate-200/30">
      <table className="w-full text-sm">
        <thead className="border-b border-white/50 bg-white/40 backdrop-blur-md">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipe</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden md:table-cell">Origin</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden lg:table-cell">Resep</th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/30">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-white/40 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800">{row.name}</p>
                {row.description && <p className="text-[11px] text-zinc-400 truncate max-w-[200px]">{row.description}</p>}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${PROD_TYPE_COLOR[row.type]}`}>
                  {PROD_TYPE_LABEL[row.type]}
                </span>
                <span className="ml-1.5 text-xs text-zinc-500 hidden sm:inline">{PROD_TYPE_FULL[row.type]}</span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{row.origin ?? "—"}</td>
              <td className="px-4 py-3 hidden lg:table-cell">
                {row.type === "FINISHED_GOODS"
                  ? row.recipe
                    ? <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600"><CheckCircle2 size={10} />{row.recipe.items.length} bahan</span>
                    : <span className="text-[11px] text-zinc-300">Belum ada resep</span>
                  : <span className="text-xs text-zinc-300">—</span>}
              </td>
              <td className="px-4 py-3 text-center"><ActiveBadge active={row.isActive} /></td>
              <td className="px-4 py-3 text-center"><EditButton onClick={() => onEdit(row)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// Packaging Table
// =============================================================================

function PackagingTable({ rows, onEdit }: { rows: PackagingRow[]; onEdit: (r: PackagingRow) => void }) {
  if (rows.length === 0) return <EmptyState label="kemasan" />;
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl shadow-lg shadow-slate-200/30">
      <table className="w-full text-sm">
        <thead className="border-b border-white/50 bg-white/40 backdrop-blur-md">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Kode</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama</th>
            <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Berat (g)</th>
            <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">HPP (Rp)</th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/30">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-white/40 transition-colors">
              <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{row.code}</td>
              <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
              <td className="px-4 py-3 text-right text-xs text-slate-600">{row.weightGrams}</td>
              <td className="px-4 py-3 text-right text-xs text-slate-600">{row.costPerUnit.toLocaleString("id-ID")}</td>
              <td className="px-4 py-3 text-center"><ActiveBadge active={row.isActive} /></td>
              <td className="px-4 py-3 text-center"><EditButton onClick={() => onEdit(row)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// User Table
// =============================================================================

function UserTable({ rows, onEdit }: { rows: UserRow[]; onEdit: (r: UserRow) => void }) {
  if (rows.length === 0) return <EmptyState label="pengguna" />;
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl shadow-lg shadow-slate-200/30">
      <table className="w-full text-sm">
        <thead className="border-b border-white/50 bg-white/40 backdrop-blur-md">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden md:table-cell">Email</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Role</th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
            <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/30">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-white/40 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800">{row.name}</p>
                <p className="text-[11px] text-zinc-400 md:hidden">{row.email}</p>
              </td>
              <td className="px-4 py-3 text-xs text-zinc-500 hidden md:table-cell">{row.email}</td>
              <td className="px-4 py-3"><RoleBadge role={row.role} /></td>
              <td className="px-4 py-3 text-center"><ActiveBadge active={row.isActive} /></td>
              <td className="px-4 py-3 text-center">
                <EditButton onClick={() => onEdit(row)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// Main Client
// =============================================================================

export function MasterDataClient({ data, userRole }: MasterDataClientProps) {
  const router = useRouter();
  
  const TABS = useMemo(() => getTabsForRole(userRole), [userRole]);
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0].id);
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [mode, setMode]                     = useState<"create" | "edit">("create");
  const [editSupplier, setEditSupplier]     = useState<SupplierRow | null>(null);
  const [editCustomer, setEditCustomer]     = useState<CustomerRow | null>(null);
  const [editProduct,  setEditProduct]      = useState<ProductRow  | null>(null);
  const [editPackaging, setEditPackaging]   = useState<PackagingRow| null>(null);
  const [editUser,     setEditUser]         = useState<UserRow     | null>(null);

  const rawMaterials = useMemo(() => data.products.filter((p) => p.type === "ROASTED_BEAN" || p.type === "GREEN_BEAN"), [data.products]);

  const handleTabChange = (tab: Tab) => {
    setDrawerOpen(false);
    setMode("create");
    setEditSupplier(null); setEditCustomer(null); setEditProduct(null); setEditUser(null); setEditPackaging(null);
    setActiveTab(tab);
  };

  const openCreate = () => {
    setMode("create");
    setEditSupplier(null); setEditCustomer(null); setEditProduct(null); setEditUser(null); setEditPackaging(null);
    setDrawerOpen(true);
  };

  const openEditSupplier = (row: SupplierRow) => {
    setMode("edit"); setEditSupplier(row); setActiveTab("supplier"); setDrawerOpen(true);
  };
  const openEditCustomer = (row: CustomerRow) => {
    setMode("edit"); setEditCustomer(row); setActiveTab("pelanggan"); setDrawerOpen(true);
  };
  const openEditProduct = (row: ProductRow) => {
    setMode("edit"); setEditProduct(row); setActiveTab("produk"); setDrawerOpen(true);
  };
  const openEditPackaging = (row: PackagingRow) => {
    setMode("edit"); setEditPackaging(row); setActiveTab("kemasan"); setDrawerOpen(true);
  };
  const openEditUser = (row: UserRow) => {
    setMode("edit"); setEditUser(row); setActiveTab("pengguna"); setDrawerOpen(true);
  };

  const handleSuccess = () => {
    setDrawerOpen(false);
    setMode("create");
    setEditSupplier(null); setEditCustomer(null); setEditProduct(null); setEditUser(null); setEditPackaging(null);
    router.refresh();
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab)!;

  const drawerTitle =
    mode === "edit"
      ? activeTab === "supplier"  ? `Edit Supplier${editSupplier  ? ` · ${editSupplier.code}`  : ""}`
      : activeTab === "pelanggan" ? `Edit Pelanggan${editCustomer ? ` · ${editCustomer.code}` : ""}`
      : activeTab === "produk"    ? `Edit Produk${editProduct     ? ` · ${editProduct.code}`   : ""}`
      : activeTab === "kemasan"   ? `Edit Kemasan${editPackaging   ? ` · ${editPackaging.code}`   : ""}`
      :                             `Edit Pengguna${editUser      ? ` · ${editUser.email}`      : ""}`
      : activeTab === "supplier"  ? "Tambah Supplier"
      : activeTab === "pelanggan" ? "Tambah Pelanggan"
      : activeTab === "produk"    ? "Tambah Produk"
      : activeTab === "kemasan"   ? "Tambah Kemasan"
      :                             "Tambah Pengguna";

  const submitFormId =
    activeTab === "supplier"  ? "supplier-form"  :
    activeTab === "pelanggan" ? "customer-form"  :
    activeTab === "produk"    ? "product-form"   :
    activeTab === "kemasan"   ? "packaging-form" :
                                "user-form";

  // Drawer size: product form with recipe needs more space
  const drawerSize = activeTab === "produk" ? "lg" : "md";

  return (
    <>
      <StandardPageLayout
        title="Data Master"
        description="Kelola referensi Supplier, Pelanggan, Produk, dan Pengguna"
        actionButton={
          <Button size="sm" onClick={openCreate} className="gap-1.5 bg-blue-500 text-white hover:bg-blue-600 font-bold shadow-md rounded-xl">
            <Plus size={14} />
            Tambah {activeTabMeta.label}
          </Button>
        }
      >
        {/* ── Tab pills ── */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-2 bg-white/20 p-2 rounded-2xl backdrop-blur-md border border-white/50">
          {TABS.map((tab) => {
            const Icon   = tab.icon;
            const active = tab.id === activeTab;
            const count  = tab.count(data);
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl py-2 px-2 text-[10px] sm:text-xs font-bold transition-all duration-300 shadow-sm text-center",
                  active
                    ? "bg-blue-500 text-white shadow-md ring-2 ring-blue-500/20 scale-[1.02]"
                    : "bg-white/40 text-slate-600 border border-white/60 hover:bg-white/60 hover:text-slate-800 hover:scale-[1.02]"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={14} />
                  <span className="leading-tight">{tab.label}</span>
                </div>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider",
                  active ? "bg-white/20 text-white" : "bg-slate-900/10 text-slate-500"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Table content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "supplier"  && <SupplierTable rows={data.suppliers} onEdit={openEditSupplier} />}
            {activeTab === "pelanggan" && <CustomerTable rows={data.customers} onEdit={openEditCustomer} />}
            {activeTab === "produk"    && <ProductTable  rows={data.products}  onEdit={openEditProduct}  />}
            {activeTab === "pengguna"  && <UserTable     rows={data.users}     onEdit={openEditUser}     />}
          </motion.div>
        </AnimatePresence>
      </StandardPageLayout>

      {/* ── Drawer ── */}
      <StandardDrawer
        open={drawerOpen}
        onOpenChange={(v) => { if (!isSubmitting) { setDrawerOpen(v); if (!v) { setMode("create"); setEditSupplier(null); setEditCustomer(null); setEditProduct(null); setEditUser(null); } } }}
        title={drawerTitle}
        size={drawerSize}
        submitButton={
          <Button type="submit" form={submitFormId} size="sm" disabled={isSubmitting} className="gap-1.5 bg-blue-500 text-white hover:bg-blue-600 font-bold shadow-md rounded-xl disabled:opacity-60">
            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
            {isSubmitting ? "Menyimpan..." : (mode === "edit" ? "Simpan Perubahan" : "Simpan")}
          </Button>
        }
      >
        {activeTab === "supplier" && (
          <SupplierForm
            id="supplier-form"
            onSuccess={handleSuccess}
            onPendingChange={setIsSubmitting}
            initialData={mode === "edit" ? editSupplier ?? undefined : undefined}
          />
        )}
        {activeTab === "pelanggan" && (
          <CustomerForm
            id="customer-form"
            onSuccess={handleSuccess}
            onPendingChange={setIsSubmitting}
            initialData={mode === "edit" ? editCustomer ?? undefined : undefined}
          />
        )}
        {activeTab === "produk" && (
          <ProductForm
            id="product-form"
            onSuccess={handleSuccess}
            onPendingChange={setIsSubmitting}
            initialData={mode === "edit" ? editProduct ?? undefined : undefined}
            rawMaterials={rawMaterials}
            packagings={data.packagings}
          />
        )}
        {activeTab === "kemasan" && (
          <PackagingForm
            id="packaging-form"
            onSuccess={handleSuccess}
            onPendingChange={setIsSubmitting}
            initialData={mode === "edit" ? editPackaging ?? undefined : undefined}
          />
        )}
        {activeTab === "pengguna" && (
          <UserForm
            id="user-form"
            onSuccess={handleSuccess}
            onPendingChange={setIsSubmitting}
            initialData={mode === "edit" ? editUser ?? undefined : undefined}
          />
        )}
      </StandardDrawer>
    </>
  );
}