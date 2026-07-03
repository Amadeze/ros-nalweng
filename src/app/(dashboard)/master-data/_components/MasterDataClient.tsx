"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Building2, Users, Package, CheckCircle2, XCircle, Pencil, UserCog } from "lucide-react";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { StandardDrawer } from "@/components/StandardDrawer";
import { Button } from "@/components/ui/button";
import { SupplierForm } from "./SupplierForm";
import { CustomerForm } from "./CustomerForm";
import { ProductForm } from "./ProductForm";
import { UserForm } from "./UserForm";
import type { MasterPageData, SupplierRow, CustomerRow, ProductRow, UserRow } from "../actions";

// =============================================================================
// Tab definition
// =============================================================================

type Tab = "supplier" | "pelanggan" | "produk" | "pengguna";

const TABS: { id: Tab; label: string; icon: React.ElementType; count: (d: MasterPageData) => number }[] = [
  { id: "supplier",  label: "Supplier",  icon: Building2, count: (d) => d.suppliers.length },
  { id: "pelanggan", label: "Pelanggan", icon: Users,     count: (d) => d.customers.length },
  { id: "produk",    label: "Produk",    icon: Package,   count: (d) => d.products.length  },
  { id: "pengguna",  label: "Pengguna",  icon: UserCog,   count: (d) => d.users.length     },
];

// =============================================================================
// Product type helpers
// =============================================================================

const PROD_TYPE_LABEL: Record<ProductRow["type"], string> = {
  GREEN_BEAN:     "GB",
  ROASTED_BEAN:   "RB",
  FINISHED_GOODS: "FG",
};
const PROD_TYPE_COLOR: Record<ProductRow["type"], string> = {
  GREEN_BEAN:     "bg-lime-100 text-lime-700",
  ROASTED_BEAN:   "bg-amber-100 text-amber-700",
  FINISHED_GOODS: "bg-violet-100 text-violet-700",
};
const PROD_TYPE_FULL: Record<ProductRow["type"], string> = {
  GREEN_BEAN:     "Green Bean",
  ROASTED_BEAN:   "Roasted Bean",
  FINISHED_GOODS: "Finished Goods",
};

// =============================================================================
// Shared helpers
// =============================================================================

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <p className="text-sm font-medium text-zinc-400">Belum ada {label}</p>
      <p className="text-xs text-zinc-300">Klik tombol &quot;Tambah&quot; di kanan atas untuk menambahkan.</p>
    </div>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return active
    ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700"><CheckCircle2 size={9} />Aktif</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500"><XCircle size={9} />Nonaktif</span>;
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-700"
    >
      <Pencil size={10} /> Edit
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
    <div className="overflow-hidden rounded-xl border border-zinc-100">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-100 bg-zinc-50/80">
          <tr>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Kode</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Nama</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400 hidden md:table-cell">No. Telp</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400 hidden lg:table-cell">Wilayah</th>
            <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Beli</th>
            <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Status</th>
            <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 bg-white">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-4 py-3 font-mono text-xs font-semibold text-zinc-600">{row.code}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-zinc-800">{row.name}</p>
                {row.address && <p className="text-[11px] text-zinc-400 truncate max-w-[180px]">{row.address}</p>}
              </td>
              <td className="px-4 py-3 text-xs text-zinc-500 hidden md:table-cell">{row.phone ?? "—"}</td>
              <td className="px-4 py-3 hidden lg:table-cell">
                {row.region
                  ? <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700">{row.region}</span>
                  : <span className="text-xs text-zinc-300">—</span>}
              </td>
              <td className="px-4 py-3 text-center font-mono text-xs font-semibold text-zinc-700">{row.purchaseCount}×</td>
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
    <div className="overflow-hidden rounded-xl border border-zinc-100">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-100 bg-zinc-50/80">
          <tr>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Kode</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Nama</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400 hidden md:table-cell">No. Telp</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400 hidden lg:table-cell">Email</th>
            <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Nota</th>
            <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Status</th>
            <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 bg-white">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-4 py-3 font-mono text-xs font-semibold text-zinc-600">{row.code}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-zinc-800">{row.name}</p>
                {row.address && <p className="text-[11px] text-zinc-400 truncate max-w-[180px]">{row.address}</p>}
              </td>
              <td className="px-4 py-3 text-xs text-zinc-500 hidden md:table-cell">{row.phone ?? "—"}</td>
              <td className="px-4 py-3 text-xs text-zinc-500 hidden lg:table-cell">{row.email ?? "—"}</td>
              <td className="px-4 py-3 text-center font-mono text-xs font-semibold text-zinc-700">{row.invoiceCount}×</td>
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
    <div className="overflow-hidden rounded-xl border border-zinc-100">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-100 bg-zinc-50/80">
          <tr>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Kode</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Nama</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Tipe</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400 hidden md:table-cell">Origin</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400 hidden lg:table-cell">Resep</th>
            <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Status</th>
            <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 bg-white">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-4 py-3 font-mono text-xs font-semibold text-zinc-600">{row.code}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-zinc-800">{row.name}</p>
                {row.description && <p className="text-[11px] text-zinc-400 truncate max-w-[200px]">{row.description}</p>}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${PROD_TYPE_COLOR[row.type]}`}>
                  {PROD_TYPE_LABEL[row.type]}
                </span>
                <span className="ml-1.5 text-xs text-zinc-500 hidden sm:inline">{PROD_TYPE_FULL[row.type]}</span>
              </td>
              <td className="px-4 py-3 text-xs text-zinc-500 hidden md:table-cell">{row.origin ?? "—"}</td>
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
// User Table
// =============================================================================

function UserTable({ rows, onEdit }: { rows: UserRow[]; onEdit: (r: UserRow) => void }) {
  if (rows.length === 0) return <EmptyState label="pengguna" />;
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-100">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-100 bg-zinc-50/80">
          <tr>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Nama</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400 hidden md:table-cell">Email</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Role</th>
            <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Status</th>
            <th className="px-4 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 bg-white">
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onEdit(row)}
              className="cursor-pointer transition-colors hover:bg-zinc-50/60"
            >
              <td className="px-4 py-3">
                <p className="font-medium text-zinc-800">{row.name}</p>
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

export function MasterDataClient({ data }: { data: MasterPageData }) {
  const router = useRouter();
  const [activeTab, setActiveTab]           = useState<Tab>("supplier");
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [mode, setMode]                     = useState<"create" | "edit">("create");
  const [editSupplier, setEditSupplier]     = useState<SupplierRow | null>(null);
  const [editCustomer, setEditCustomer]     = useState<CustomerRow | null>(null);
  const [editProduct,  setEditProduct]      = useState<ProductRow  | null>(null);
  const [editUser,     setEditUser]         = useState<UserRow     | null>(null);

  const roastedBeans = data.products.filter((p) => p.type === "ROASTED_BEAN");

  const handleTabChange = (tab: Tab) => {
    setDrawerOpen(false);
    setMode("create");
    setEditSupplier(null); setEditCustomer(null); setEditProduct(null); setEditUser(null);
    setActiveTab(tab);
  };

  const openCreate = () => {
    setMode("create");
    setEditSupplier(null); setEditCustomer(null); setEditProduct(null); setEditUser(null);
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
  const openEditUser = (row: UserRow) => {
    setMode("edit"); setEditUser(row); setActiveTab("pengguna"); setDrawerOpen(true);
  };

  const handleSuccess = () => {
    setDrawerOpen(false);
    setMode("create");
    setEditSupplier(null); setEditCustomer(null); setEditProduct(null); setEditUser(null);
    router.refresh();
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab)!;

  const drawerTitle =
    mode === "edit"
      ? activeTab === "supplier"  ? `Edit Supplier${editSupplier  ? ` · ${editSupplier.code}`  : ""}`
      : activeTab === "pelanggan" ? `Edit Pelanggan${editCustomer ? ` · ${editCustomer.code}` : ""}`
      : activeTab === "produk"    ? `Edit Produk${editProduct     ? ` · ${editProduct.code}`   : ""}`
      :                             `Edit Pengguna${editUser      ? ` · ${editUser.email}`      : ""}`
      : activeTab === "supplier"  ? "Tambah Supplier"
      : activeTab === "pelanggan" ? "Tambah Pelanggan"
      : activeTab === "produk"    ? "Tambah Produk"
      :                             "Tambah Pengguna";

  const submitFormId =
    activeTab === "supplier"  ? "supplier-form"  :
    activeTab === "pelanggan" ? "customer-form"  :
    activeTab === "produk"    ? "product-form"   :
                                "user-form";

  // Drawer size: product form with recipe needs more space
  const drawerSize = activeTab === "produk" ? "lg" : "md";

  return (
    <>
      <StandardPageLayout
        title="Data Master"
        description="Kelola referensi Supplier, Pelanggan, Produk, dan Pengguna"
        actionButton={
          <Button size="sm" onClick={openCreate} className="gap-1.5 bg-zinc-900 text-white hover:bg-zinc-700">
            <Plus size={14} />
            Tambah {activeTabMeta.label}
          </Button>
        }
      >
        {/* ── Tab pills ── */}
        <div className="mb-5 flex gap-1.5 rounded-xl border border-zinc-100 bg-zinc-50/80 p-1 w-fit">
          {TABS.map((tab) => {
            const Icon   = tab.icon;
            const active = tab.id === activeTab;
            const count  = tab.count(data);
            return (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className={["flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
                  active ? "bg-white text-zinc-900 shadow-sm border border-zinc-200" : "text-zinc-500 hover:text-zinc-700 hover:bg-white/60"].join(" ")}>
                <Icon size={14} />
                {tab.label}
                <span className={["rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  active ? "bg-zinc-100 text-zinc-600" : "bg-zinc-200/70 text-zinc-400"].join(" ")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Table content ── */}
        {activeTab === "supplier"  && <SupplierTable rows={data.suppliers} onEdit={openEditSupplier} />}
        {activeTab === "pelanggan" && <CustomerTable rows={data.customers} onEdit={openEditCustomer} />}
        {activeTab === "produk"    && <ProductTable  rows={data.products}  onEdit={openEditProduct}  />}
        {activeTab === "pengguna"  && <UserTable     rows={data.users}     onEdit={openEditUser}     />}
      </StandardPageLayout>

      {/* ── Drawer ── */}
      <StandardDrawer
        open={drawerOpen}
        onOpenChange={(v) => { setDrawerOpen(v); if (!v) { setMode("create"); setEditSupplier(null); setEditCustomer(null); setEditProduct(null); setEditUser(null); } }}
        title={drawerTitle}
        size={drawerSize}
        submitButton={
          <Button type="submit" form={submitFormId} size="sm" className="gap-1.5 bg-zinc-900 text-white hover:bg-zinc-700">
            {mode === "edit" ? "Simpan Perubahan" : "Simpan"}
          </Button>
        }
      >
        {activeTab === "supplier" && (
          <SupplierForm
            id="supplier-form"
            onSuccess={handleSuccess}
            initialData={mode === "edit" ? editSupplier ?? undefined : undefined}
          />
        )}
        {activeTab === "pelanggan" && (
          <CustomerForm
            id="customer-form"
            onSuccess={handleSuccess}
            initialData={mode === "edit" ? editCustomer ?? undefined : undefined}
          />
        )}
        {activeTab === "produk" && (
          <ProductForm
            id="product-form"
            onSuccess={handleSuccess}
            initialData={mode === "edit" ? editProduct ?? undefined : undefined}
            roastedBeans={roastedBeans}
            packagings={data.packagings}
          />
        )}
        {activeTab === "pengguna" && (
          <UserForm
            id="user-form"
            onSuccess={handleSuccess}
            initialData={mode === "edit" ? editUser ?? undefined : undefined}
          />
        )}
      </StandardDrawer>
    </>
  );
}