"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2, FlaskConical, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProduct, updateProduct } from "../actions";
import type { ProductRow, PackagingRow } from "../actions";
import { cn } from "@/lib/utils";

const glassInput = "bg-white/40 border-white/60 backdrop-blur-md transition-all focus:bg-white/60 focus:border-white/80";
const glassCard = "rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl p-4 shadow-sm";

// =============================================================================
// Constants
// =============================================================================

const PRODUCT_TYPES = [
  { value: "GREEN_BEAN",     label: "Green Bean (Mentah)" },
  { value: "ROASTED_BEAN",   label: "Roasted Bean (Matang)" },
  { value: "FINISHED_GOODS", label: "Finished Goods (Produk Jadi)" },
  { value: "PACKAGING",      label: "Packaging (Kemasan)" },
  
] as const;

const ROAST_LEVELS = [
  { value: "LIGHT",       label: "Light" },
  { value: "MEDIUM",      label: "Medium" },
  { value: "MEDIUM_DARK", label: "Medium Dark" },
  { value: "DARK",        label: "Dark" },
] as const;

// =============================================================================
// Schema
// =============================================================================

const recipeItemSchema = z.object({
  rbProductId:  z.string(),
  gramsPerUnit: z.number(),
});

const schema = z.object({
  name:              z.string().min(1, "Nama wajib diisi"),
  type:              z.enum(["GREEN_BEAN", "ROASTED_BEAN", "FINISHED_GOODS", "PACKAGING"]),
  origin:            z.string().optional(),
  roastLevel:        z.enum(["LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"]).nullable().optional(),
  description:       z.string().optional(),
  price:             z.number().optional(),
  priceSilver:       z.number().optional(),
  priceGold:         z.number().optional(),
  isActive:          z.boolean(),
  recipePackagingId: z.string().optional(),
  recipeOutputGrams: z.number().optional(),
  recipeNotes:       z.string().optional(),
  recipeItems:       z.array(recipeItemSchema).optional(),
});

type FormValues = z.infer<typeof schema>;

// =============================================================================
// Props
// =============================================================================

interface ProductFormProps {
  id:           string;
  onSuccess:    () => void;
  onPendingChange?: (isPending: boolean) => void;
  initialData?: ProductRow;
  rawMaterials: Array<{ id: string; name: string; code: string; type?: string }>;
  packagings:   PackagingRow[];
}

// =============================================================================
// Component
// =============================================================================

export function ProductForm({ id, onSuccess, onPendingChange, initialData, rawMaterials, packagings }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;
  const existingRecipe = initialData?.recipe ?? null;

  const defaultRecipeItems = existingRecipe?.items.map((i) => ({
    rbProductId:  i.rbProductId,
    gramsPerUnit: i.gramsPerUnit,
  })) ?? [];

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          name:              initialData.name,
          type:              initialData.type,
          origin:            initialData.origin ?? "",
          roastLevel:        (initialData.roastLevel as FormValues["roastLevel"]) ?? null,
          description:       initialData.description ?? "",
          price:             initialData.price ?? 0,
          priceSilver:       initialData.priceSilver ?? 0,
          priceGold:         initialData.priceGold ?? 0,
          isActive:          initialData.isActive,
          recipePackagingId: existingRecipe?.packagingId ?? "",
          recipeOutputGrams: existingRecipe?.outputGrams ?? 0,
          recipeNotes:       existingRecipe?.notes ?? "",
          recipeItems:       defaultRecipeItems,
        }
      : {
          name: "", type: "GREEN_BEAN", origin: "", roastLevel: null,
          description: "", price: 0, priceSilver: 0, priceGold: 0, isActive: true,
          recipePackagingId: "", recipeOutputGrams: 0, recipeNotes: "", recipeItems: [],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "recipeItems" });

  const selectedType     = watch("type");
  const recipeItems      = watch("recipeItems") ?? [];
  const recipeOutputGrams = watch("recipeOutputGrams") ?? 0;
  const totalGrams       = recipeItems.reduce((s, i) => s + (Number(i.gramsPerUnit) || 0), 0);
  const isFG             = selectedType === "FINISHED_GOODS";

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    onPendingChange?.(true);

    // Validate recipe section if user partially filled it
    const hasItems = (values.recipeItems ?? []).length > 0;
    if (isFG && hasItems) {
      if (!values.recipePackagingId) {
        toast.error("Pilih kemasan untuk resep terlebih dahulu."); setIsSubmitting(false); onPendingChange?.(false); return;
      }
      if (!values.recipeOutputGrams || values.recipeOutputGrams <= 0) {
        toast.error("Isi output gram per unit untuk resep."); setIsSubmitting(false); onPendingChange?.(false); return;
      }
      const badItem = values.recipeItems!.find((i) => !i.rbProductId || (i.gramsPerUnit ?? 0) <= 0);
      if (badItem) { toast.error("Setiap bahan resep harus dipilih dan diisi gramnya."); setIsSubmitting(false); onPendingChange?.(false); return; }

      // Validate mixing GREEN_BEAN and ROASTED_BEAN
      const typesInRecipe = new Set(values.recipeItems!.map(i => rawMaterials.find(rm => rm.id === i.rbProductId)?.type));
      if (typesInRecipe.has("GREEN_BEAN") && typesInRecipe.has("ROASTED_BEAN")) {
        toast.error("Resep tidak boleh mencampur Green Bean dan Roasted Bean."); setIsSubmitting(false); onPendingChange?.(false); return;
      }
    }

    const recipe = isFG && hasItems && values.recipePackagingId && values.recipeOutputGrams
      ? {
          packagingId: values.recipePackagingId,
          outputGrams: values.recipeOutputGrams,
          notes:       values.recipeNotes || undefined,
          items:       values.recipeItems!.map((i) => ({
            rbProductId:  i.rbProductId,
            gramsPerUnit: i.gramsPerUnit,
          })),
        }
      : undefined;

    try {
      const result = isEditMode
        ? await updateProduct({ id: initialData!.id, name: values.name, origin: values.origin, roastLevel: values.roastLevel, description: values.description, price: values.price, priceSilver: values.priceSilver, priceGold: values.priceGold, isActive: values.isActive, recipe })
        : await createProduct({ name: values.name, type: values.type, origin: values.origin, roastLevel: values.roastLevel, description: values.description, price: values.price, priceSilver: values.priceSilver, priceGold: values.priceGold, recipe });

      if (!result.success) { toast.error(result.error); return; }
      toast.success(isEditMode ? `Produk ${result.code} berhasil diperbarui` : `Produk ${result.code} berhasil ditambahkan`);
      onSuccess();
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
      onPendingChange?.(false);
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative">
      {/* ── Nama ── */}
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Nama Produk <span className="text-red-500">*</span></Label>
        <Input placeholder="Arabica Gayo, Full Arabica 250g, dll." className={cn("h-9 font-medium", glassInput)} {...register("name")} />
        {errors.name && <p className="text-[10px] text-red-500 font-medium pt-0.5">{errors.name.message}</p>}
      </div>

      {/* ── Tipe ── */}
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Tipe Produk <span className="text-red-500">*</span></Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(v) => v && field.onChange(v)} disabled={isEditMode}>
              <SelectTrigger className={cn("h-9 w-full text-sm", glassInput)}>
                <SelectValue placeholder="Pilih tipe...">
                  {field.value ? PRODUCT_TYPES.find((t) => t.value === field.value)?.label : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {isEditMode && (
          <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1 pt-0.5">
            <Info size={12} className="opacity-70" /> Tipe tidak dapat diubah setelah produk dibuat.
          </p>
        )}
      </div>

      {/* ── Origin ── */}
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Origin / Asal</Label>
        <Input placeholder="Gayo, Toraja, Ethiopia, dll." className={cn("h-9", glassInput)} {...register("origin")} />
      </div>

      {/* ── Roast Level (ROASTED_BEAN only) ── */}
      {selectedType === "ROASTED_BEAN" && (
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Tingkat Roast</Label>
          <Controller
            control={control}
            name="roastLevel"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || null)}>
                <SelectTrigger className={cn("h-9 w-full text-sm", glassInput)}>
                  <SelectValue placeholder="Pilih tingkat roast...">
                    {field.value ? ROAST_LEVELS.find((r) => r.value === field.value)?.label : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ROAST_LEVELS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      {/* ── Deskripsi ── */}
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Deskripsi (opsional)</Label>
        <Input placeholder="Tasting notes, karakteristik, dll." className={cn("h-9", glassInput)} {...register("description")} />
      </div>

      {/* ── Harga Jual (FINISHED_GOODS only) ── */}
      {selectedType === "FINISHED_GOODS" && (
        <div className={cn(glassCard, "space-y-4")}>
          <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Harga Jual (Tiered Pricing)</h3>
          
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Harga Retail (Eceran)</Label>
            <Input type="number" placeholder="0" className={cn("h-9 font-semibold", glassInput)} {...register("price", { valueAsNumber: true })} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Harga Grosir Silver</Label>
              <Input type="number" placeholder="0" className={cn("h-9", glassInput)} {...register("priceSilver", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Harga Grosir Gold</Label>
              <Input type="number" placeholder="0" className={cn("h-9", glassInput)} {...register("priceGold", { valueAsNumber: true })} />
            </div>
          </div>
        </div>
      )}

      {/* ── Status (edit mode only) ── */}
      {isEditMode && (
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Status</Label>
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <div className="flex gap-2">
                {[{ v: true, label: "Aktif", cls: "border-blue-500 bg-blue-500 text-white shadow-md ring-2 ring-blue-500/20 ring-offset-1" }, { v: false, label: "Nonaktif", cls: "border-white/60 bg-white/40 text-slate-500 hover:bg-white/60" }].map(({ v, label, cls }) => (
                  <button key={String(v)} type="button" onClick={() => field.onChange(v)}
                    className={cn("flex-1 rounded-xl border py-2 text-xs font-bold transition-all shadow-sm",
                      field.value === v ? cls : "border-white/60 bg-white/40 text-slate-500 hover:bg-white/60")}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          />
        </div>
      )}

      {/* ================================================================
          RECIPE SECTION — hanya untuk FINISHED_GOODS
          ================================================================ */}
      {isFG && (
        <div className={cn(glassCard, "space-y-5")}>
          {/* Section header */}
          <div className="flex items-center gap-2">
            <FlaskConical size={16} className="text-violet-500 drop-shadow-sm" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Resep Produksi</h3>
            <span className="rounded-full bg-white/50 border border-white/60 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-500 shadow-sm">opsional</span>
          </div>

          {/* Packaging + Output grams — 2 col */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Kemasan Default</Label>
              <Controller
                control={control}
                name="recipePackagingId"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || "")}>
                    <SelectTrigger className={cn("h-9 w-full text-sm", glassInput)}>
                      <SelectValue placeholder="Pilih kemasan...">
                        {field.value ? packagings.find((pkg) => pkg.id === field.value)?.name : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {packagings.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Output (gram / unit)</Label>
              <Input
                type="number" min="1" step="1" placeholder="250"
                className={cn("h-9 font-semibold tabular-nums", glassInput)}
                {...register("recipeOutputGrams", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Recipe items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Komposisi Bahan (Green Bean / Roasted Bean)</Label>
              {fields.length > 0 && recipeOutputGrams > 0 && (
                <span className={`text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full border ${Math.abs(totalGrams - recipeOutputGrams) < 0.01 ? "bg-emerald-50/50 border-emerald-200 text-emerald-700" : "bg-amber-50/50 border-amber-200 text-amber-700"}`}>
                  Total: {totalGrams}g / {recipeOutputGrams}g
                </span>
              )}
            </div>

            {fields.length === 0 && (
              <p className="text-xs text-slate-400 font-medium py-2">
                Belum ada bahan. Klik "+ Tambah Bahan" untuk menambahkan komposisi.
              </p>
            )}

            <div className="space-y-2 relative">
              {fields.map((field, index) => (
                <div key={field.id} className="relative flex flex-wrap sm:flex-nowrap items-start gap-4 rounded-xl border border-white/60 bg-white/40 backdrop-blur-md p-4 shadow-sm hover:shadow transition-all group">
                  
                  {/* Remove (absolute hover) */}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute -top-3 -right-2 bg-white text-red-500 border border-white/60 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-sm z-10"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  {/* RB selector */}
                  <div className="flex-1 min-w-[150px] space-y-1">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Bahan Baku</Label>
                    <Controller
                      control={control}
                      name={`recipeItems.${index}.rbProductId`}
                      render={({ field: f }) => (
                        <Select value={f.value ?? ""} onValueChange={(v) => f.onChange(v || "")}>
                          <SelectTrigger className={cn("h-9 w-full text-xs font-medium", glassInput)}>
                            <SelectValue placeholder="Pilih Bahan Baku...">
                              {f.value ? rawMaterials.find((rm) => rm.id === f.value)?.name : null}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {rawMaterials.map((rm) => (
                              <SelectItem key={rm.id} value={rm.id}>
                                {rm.name} {rm.type === "GREEN_BEAN" ? "(GB)" : "(RB)"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Grams */}
                  <div className="w-28 shrink-0 space-y-1">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Gramasi</Label>
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="number" min="0.1" step="0.1" placeholder="0"
                          className={cn("h-9 text-right tabular-nums text-sm font-semibold pr-6", glassInput)}
                          {...register(`recipeItems.${index}.gramsPerUnit`, { valueAsNumber: true })}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">g</span>
                      </div>
                      
                      {/* Ratio preview */}
                      {recipeOutputGrams > 0 && (
                        <span className="w-10 shrink-0 text-right text-[11px] font-bold text-slate-400 tabular-nums">
                          {recipeOutputGrams > 0
                            ? `${((Number(recipeItems[index]?.gramsPerUnit) || 0) / recipeOutputGrams * 100).toFixed(0)}%`
                            : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => append({ rbProductId: "", gramsPerUnit: 0 })}
              className="flex w-fit items-center gap-1 rounded-lg border border-white/60 bg-white/30 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white/50 transition-colors shadow-sm"
            >
              <Plus size={14} /> Tambah Bahan
            </button>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Catatan Resep (opsional)</Label>
            <Input placeholder="Instruksi, variasi, dll." className={cn("h-9", glassInput)} {...register("recipeNotes")} />
          </div>
        </div>
      )}

      <button type="submit" className="hidden" disabled={isSubmitting} />
    </form>
  );
}