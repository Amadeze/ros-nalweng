"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Package } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Pastikan kamu punya server action ini (buat jika belum ada)
import { createPackagingPurchase, createPackaging } from "../actions"; 

// =============================================================================
// Schemas
// =============================================================================

const purchaseSchema = z.object({
  supplierId:    z.string().min(1, "Pilih supplier"),
  receivedAt:    z.string().min(1, "Tanggal wajib diisi"),
  packagingId:   z.string().min(1, "Pilih kemasan"),
  quantityUnits: z.number({ error: "Harus angka" }).int().positive("Qty harus > 0"),
  pricePerUnit:  z.number({ error: "Harus angka" }).min(0, "Harga minimal 0"),
  shippingCost:  z.number({ error: "Harus angka" }).min(0),
  notes:         z.string().optional(),
});

const quickAddSchema = z.object({
  code:        z.string().min(1, "Kode wajib diisi"),
  name:        z.string().min(1, "Nama wajib diisi"),
  weightGrams: z.number().min(0),
  costPerUnit: z.number().min(0),
});

type FormValues = z.infer<typeof purchaseSchema>;
type QuickAddValues = z.infer<typeof quickAddSchema>;

interface PackagingOption { id: string; name: string; code: string; costPerUnit: number; }
interface SupplierOption  { id: string; code: string; name: string; }

interface PackagingPurchaseFormProps {
  suppliers:  SupplierOption[];
  packagings: PackagingOption[];
  onSuccess:  () => void;
}

// Glassmorphism Utilities
const glassInput = "h-9 bg-white/40 border-white/60 backdrop-blur-md transition-all focus:bg-white/60 text-sm";
const glassCard = "rounded-[1rem] border border-white/60 bg-white/30 backdrop-blur-xl p-4 shadow-sm";

// =============================================================================
// Main Component
// =============================================================================

export function PackagingPurchaseForm({ suppliers, packagings, onSuccess }: PackagingPurchaseFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [submitting, setSubmitting] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isAddingPkg, setIsAddingPkg] = useState(false);

  // Form Utama (Pembelian)
  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { receivedAt: today, shippingCost: 0, pricePerUnit: 0 },
  });

  // Form Mini (Quick Add Kemasan)
  const { register: regQuickAdd, handleSubmit: handleQuickAddSubmit, reset: resetQuickAdd, formState: { errors: qaErrors } } = useForm<QuickAddValues>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: { weightGrams: 0, costPerUnit: 0 },
  });

  const qty   = watch("quantityUnits") ?? 0;
  const price = watch("pricePerUnit")  ?? 0;
  const ship  = watch("shippingCost")  ?? 0;
  const total = qty * price + ship;

  // Submit Pembelian
  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const result = await createPackagingPurchase(data);
      if (!result.success) { toast.error(result.error); return; }
      toast.success(`Kemasan datang dicatat: ${result.purchaseCode}`);
      reset();
      onSuccess();
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Quick Add Kemasan
  const onQuickAdd = async (data: QuickAddValues) => {
    setIsAddingPkg(true);
    try {
      const result = await createPackaging(data); // Panggil fungsi dari actions.ts
      if (!result.success) { toast.error(result.error); return; }
      
      toast.success("Kemasan baru berhasil ditambahkan!");
      setIsQuickAddOpen(false);
      resetQuickAdd();
      
      // Otomatis pilih kemasan yang baru dibuat
      setValue("packagingId", result.packagingId, { shouldValidate: true });
      
      // Panggil onSuccess dari parent agar data packagings ter-refresh (revalidatePath)
      onSuccess(); 
    } catch {
      toast.error("Gagal menambahkan kemasan.");
    } finally {
      setIsAddingPkg(false);
    }
  };

  return (
    <>
      <form id="pkg-purchase-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1">
        {/* Supplier */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Supplier <span className="text-red-500">*</span></Label>
          <select
            className={cn(
              "w-full h-9 rounded-lg border px-3 text-sm transition-all appearance-none outline-none",
              glassInput,
              errors.supplierId ? "border-red-500 ring-2 ring-red-500/20" : ""
            )}
            {...register("supplierId")}
          >
            <option value="" disabled>Pilih supplier...</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.supplierId && <p className="text-xs text-red-500 font-medium">{errors.supplierId.message}</p>}
        </div>

        {/* Tanggal */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Tanggal Terima <span className="text-red-500">*</span></Label>
          <Input type="date" className={glassInput} {...register("receivedAt")} />
        </div>

        {/* Kemasan + Tombol Quick Add */}
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Kemasan <span className="text-red-500">*</span></Label>
            <select
              className={cn(
                "w-full h-9 rounded-lg border px-3 text-sm transition-all appearance-none outline-none",
                glassInput,
                errors.packagingId ? "border-red-500 ring-2 ring-red-500/20" : ""
              )}
              {...register("packagingId")}
            >
              <option value="" disabled>Pilih kemasan...</option>
              {packagings.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.packagingId && <p className="text-xs text-red-500 font-medium">{errors.packagingId.message}</p>}
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsQuickAddOpen(true)}
            className="h-9 w-10 shrink-0 bg-white/40 border-white/60 backdrop-blur-md hover:bg-white/60 text-slate-700 p-0 transition-all shadow-sm"
          >
            <Plus size={16} />
          </Button>
        </div>

        {/* Qty & Harga */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Qty (pcs) <span className="text-red-500">*</span></Label>
            <Input type="number" step="1" min="1" className={cn(glassInput, "text-right tabular-nums")} {...register("quantityUnits", { valueAsNumber: true })} />
            {errors.quantityUnits && <p className="text-xs text-red-500 font-medium">{errors.quantityUnits.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Harga/pcs (Rp) <span className="text-red-500">*</span></Label>
            <Input type="number" step="1" min="0" className={cn(glassInput, "text-right tabular-nums")} {...register("pricePerUnit", { valueAsNumber: true })} />
            {errors.pricePerUnit && <p className="text-xs text-red-500 font-medium">{errors.pricePerUnit.message}</p>}
          </div>
        </div>

        {/* Ongkir */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Ongkos Kirim (Rp)</Label>
          <Input type="number" step="1" min="0" placeholder="0" className={cn(glassInput, "text-right tabular-nums")} {...register("shippingCost", { valueAsNumber: true })} />
        </div>

        {/* Total */}
        {total > 0 && (
          <div className={cn(glassCard, "flex justify-between items-center")}>
            <span className="text-sm font-semibold text-slate-600">Total Biaya</span>
            <span className="font-mono font-bold text-slate-800 text-lg">
              {total.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 })}
            </span>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Catatan</Label>
          <Textarea rows={2} placeholder="Opsional..." className={cn(glassInput, "resize-none")} {...register("notes")} />
        </div>

        <Button type="submit" disabled={submitting} className="hidden" />
      </form>

      {/* ==========================================================================
          DIALOG QUICK ADD KEMASAN
          ========================================================================== */}
      <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
        <DialogContent className="sm:max-w-100 border-white/60 bg-white/40 backdrop-blur-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Package size={18} className="text-emerald-600" />
              Tambah Kemasan Baru
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleQuickAddSubmit(onQuickAdd)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Kode Kemasan *</Label>
              <Input placeholder="Misal: PKG-BOX-1KG" className={glassInput} {...regQuickAdd("code")} />
              {qaErrors.code && <p className="text-[10px] text-red-500">{qaErrors.code.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Nama Kemasan *</Label>
              <Input placeholder="Misal: Kraft Box 1KG" className={glassInput} {...regQuickAdd("name")} />
              {qaErrors.name && <p className="text-[10px] text-red-500">{qaErrors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Berat Kosong (g)</Label>
                <Input type="number" min="0" step="0.1" className={cn(glassInput, "text-right tabular-nums")} {...regQuickAdd("weightGrams", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Harga Standar (Rp)</Label>
                <Input type="number" min="0" step="1" className={cn(glassInput, "text-right tabular-nums")} {...regQuickAdd("costPerUnit", { valueAsNumber: true })} />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsQuickAddOpen(false)} className="text-slate-600 hover:bg-white/40">
                Batal
              </Button>
              <Button type="submit" disabled={isAddingPkg} className="bg-slate-800 hover:bg-slate-900 text-white shadow-md">
                {isAddingPkg ? "Menyimpan..." : "Simpan Kemasan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}