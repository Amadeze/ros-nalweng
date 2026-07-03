"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPackagingPurchase } from "../actions";
import { toast } from "sonner";

const schema = z.object({
  supplierId:    z.string().min(1, "Pilih supplier"),
  receivedAt:    z.string().min(1, "Tanggal wajib diisi"),
  packagingId:   z.string().min(1, "Pilih kemasan"),
  quantityUnits: z.number({ error: "Harus angka" }).int().positive("Qty harus > 0"),
  pricePerUnit:  z.number({ error: "Harus angka" }).positive("Harga harus > 0"),
  shippingCost:  z.number({ error: "Harus angka" }).min(0),
  notes:         z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PackagingOption { id: string; name: string; code: string; costPerUnit: number; }
interface SupplierOption  { id: string; code: string; name: string; }

interface PackagingPurchaseFormProps {
  suppliers:  SupplierOption[];
  packagings: PackagingOption[];
  onSuccess:  () => void;
}

export function PackagingPurchaseForm({ suppliers, packagings, onSuccess }: PackagingPurchaseFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [submitting, setSubmitting] = useState(false);
  const [supplierId,  setSupplierId]  = useState("");
  const [packagingId, setPackagingId] = useState("");

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { receivedAt: today, shippingCost: 0 },
  });

  const qty   = watch("quantityUnits") ?? 0;
  const price = watch("pricePerUnit")  ?? 0;
  const ship  = watch("shippingCost")  ?? 0;
  const total = qty * price + ship;

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const result = await createPackagingPurchase(data);
      if (!result.success) { toast.error(result.error); return; }
      toast.success(`Kemasan datang dicatat: ${result.purchaseCode}`);
      reset();
      setSupplierId("");
      setPackagingId("");
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id="pkg-purchase-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Supplier */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Supplier <span className="text-red-500">*</span></Label>
        <Select value={supplierId} onValueChange={(v) => { setSupplierId(v ?? ""); setValue("supplierId", v ?? "", { shouldValidate: true }); }}>
          <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
          <SelectContent>
            {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.supplierId && <p className="text-xs text-red-500">{errors.supplierId.message}</p>}
      </div>

      {/* Tanggal */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Tanggal Terima <span className="text-red-500">*</span></Label>
        <Input type="date" className="h-10 text-sm" {...register("receivedAt")} />
      </div>

      {/* Kemasan */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Kemasan <span className="text-red-500">*</span></Label>
        <Select value={packagingId} onValueChange={(v) => { setPackagingId(v ?? ""); setValue("packagingId", v ?? "", { shouldValidate: true }); }}>
          <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Pilih kemasan" /></SelectTrigger>
          <SelectContent>
            {packagings.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name} <span className="text-zinc-400">({p.code})</span></SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.packagingId && <p className="text-xs text-red-500">{errors.packagingId.message}</p>}
      </div>

      {/* Qty & Harga */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-zinc-700">Qty (pcs) <span className="text-red-500">*</span></Label>
          <Input type="number" step="1" min="1" className="h-10 text-sm text-right tabular-nums" {...register("quantityUnits", { valueAsNumber: true })} />
          {errors.quantityUnits && <p className="text-xs text-red-500">{errors.quantityUnits.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-zinc-700">Harga/pcs (Rp) <span className="text-red-500">*</span></Label>
          <Input type="number" step="1" min="0" className="h-10 text-sm text-right tabular-nums" {...register("pricePerUnit", { valueAsNumber: true })} />
          {errors.pricePerUnit && <p className="text-xs text-red-500">{errors.pricePerUnit.message}</p>}
        </div>
      </div>

      {/* Ongkir */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Ongkos Kirim (Rp)</Label>
        <Input type="number" step="1" min="0" placeholder="0" className="h-10 text-sm text-right tabular-nums" {...register("shippingCost", { valueAsNumber: true })} />
      </div>

      {/* Total */}
      {total > 0 && (
        <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Total Biaya</span>
            <span className="font-mono font-bold text-zinc-900">
              {total.toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Catatan</Label>
        <Textarea rows={2} placeholder="Opsional..." className="text-sm resize-none" {...register("notes")} />
      </div>

      <Button type="submit" disabled={submitting} className="hidden" />
    </form>
  );
}
