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
  initialData?: ProductRow;
  roastedBeans: Array<{ id: string; name: string; code: string }>;
  packagings:   PackagingRow[];
}

// =============================================================================
// Component
// =============================================================================

export function ProductForm({ id, onSuccess, initialData, roastedBeans, packagings }: ProductFormProps) {
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
          isActive:          initialData.isActive,
          recipePackagingId: existingRecipe?.packagingId ?? "",
          recipeOutputGrams: existingRecipe?.outputGrams ?? 0,
          recipeNotes:       existingRecipe?.notes ?? "",
          recipeItems:       defaultRecipeItems,
        }
      : {
          name: "", type: "GREEN_BEAN", origin: "", roastLevel: null,
          description: "", isActive: true,
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
    // Validate recipe section if user partially filled it
    const hasItems = (values.recipeItems ?? []).length > 0;
    if (isFG && hasItems) {
      if (!values.recipePackagingId) {
        toast.error("Pilih kemasan untuk resep terlebih dahulu."); return;
      }
      if (!values.recipeOutputGrams || values.recipeOutputGrams <= 0) {
        toast.error("Isi output gram per unit untuk resep."); return;
      }
      const badItem = values.recipeItems!.find((i) => !i.rbProductId || (i.gramsPerUnit ?? 0) <= 0);
      if (badItem) { toast.error("Setiap bahan resep harus dipilih dan diisi gramnya."); return; }
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

    setIsSubmitting(true);
    try {
      const result = isEditMode
        ? await updateProduct({ id: initialData!.id, name: values.name, origin: values.origin, roastLevel: values.roastLevel, description: values.description, isActive: values.isActive, recipe })
        : await createProduct({ name: values.name, type: values.type, origin: values.origin, roastLevel: values.roastLevel, description: values.description, recipe });

      if (!result.success) { toast.error(result.error); return; }
      toast.success(isEditMode ? `${result.code} berhasil diperbarui` : `Produk ${result.code} berhasil ditambahkan`);
      onSuccess();
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── Nama ── */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Nama Produk <span className="text-red-500">*</span></Label>
        <Input placeholder="Arabica Gayo, Full Arabica 250g, dll." className="h-9" {...register("name")} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* ── Tipe ── */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Tipe Produk <span className="text-red-500">*</span></Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(v) => v && field.onChange(v)} disabled={isEditMode}>
              <SelectTrigger className="h-9 w-full text-sm">
                <SelectValue placeholder="Pilih tipe..." />
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
          <p className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Info size={10} /> Tipe tidak dapat diubah setelah produk dibuat.
          </p>
        )}
      </div>

      {/* ── Origin ── */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Origin / Asal</Label>
        <Input placeholder="Gayo, Toraja, Ethiopia, dll." className="h-9" {...register("origin")} />
      </div>

      {/* ── Roast Level (ROASTED_BEAN only) ── */}
      {selectedType === "ROASTED_BEAN" && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-zinc-700">Tingkat Roast</Label>
          <Controller
            control={control}
            name="roastLevel"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || null)}>
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue placeholder="Pilih tingkat roast..." />
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
        <Label className="text-xs font-medium text-zinc-700">Deskripsi (opsional)</Label>
        <Input placeholder="Tasting notes, karakteristik, dll." className="h-9" {...register("description")} />
      </div>

      {/* ── Status (edit mode only) ── */}
      {isEditMode && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-zinc-700">Status</Label>
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <div className="flex gap-2">
                {[{ v: true, label: "Aktif", cls: "bg-emerald-50 border-emerald-300 text-emerald-700" }, { v: false, label: "Nonaktif", cls: "bg-zinc-100 border-zinc-300 text-zinc-500" }].map(({ v, label, cls }) => (
                  <button key={String(v)} type="button" onClick={() => field.onChange(v)}
                    className={["flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                      field.value === v ? cls : "border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300"].join(" ")}>
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
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
          {/* Section header */}
          <div className="flex items-center gap-2">
            <FlaskConical size={14} className="text-violet-600" />
            <h3 className="text-sm font-semibold text-zinc-700">Resep Produksi</h3>
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-500">opsional</span>
          </div>

          {/* Packaging + Output grams — 2 col */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-600">Kemasan Default</Label>
              <Controller
                control={control}
                name="recipePackagingId"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || "")}>
                    <SelectTrigger className="h-9 w-full text-sm bg-white">
                      <SelectValue placeholder="Pilih kemasan..." />
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
              <Label className="text-xs font-medium text-zinc-600">Output (gram / unit)</Label>
              <Input
                type="number" min="1" step="1" placeholder="250"
                className="h-9 bg-white text-sm"
                {...register("recipeOutputGrams", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Recipe items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-zinc-600">Komposisi Bahan (Roasted Bean)</Label>
              {fields.length > 0 && recipeOutputGrams > 0 && (
                <span className={`text-[11px] font-medium ${Math.abs(totalGrams - recipeOutputGrams) < 0.01 ? "text-emerald-600" : "text-amber-600"}`}>
                  Total: {totalGrams}g / {recipeOutputGrams}g
                </span>
              )}
            </div>

            {fields.length === 0 && (
              <p className="text-[11px] text-zinc-400 py-1">
                Belum ada bahan. Klik "+ Tambah Bahan" untuk menambahkan komposisi.
              </p>
            )}

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  {/* RB selector */}
                  <div className="flex-1">
                    <Controller
                      control={control}
                      name={`recipeItems.${index}.rbProductId`}
                      render={({ field: f }) => (
                        <Select value={f.value ?? ""} onValueChange={(v) => f.onChange(v || "")}>
                          <SelectTrigger className="h-8 w-full text-xs bg-white">
                            <SelectValue placeholder="Pilih Roasted Bean..." />
                          </SelectTrigger>
                          <SelectContent>
                            {roastedBeans.map((rb) => (
                              <SelectItem key={rb.id} value={rb.id}>
                                {rb.name} <span className="text-zinc-400">({rb.code})</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  {/* Grams */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Input
                      type="number" min="0.1" step="0.1" placeholder="0"
                      className="h-8 w-20 text-right text-xs bg-white"
                      {...register(`recipeItems.${index}.gramsPerUnit`, { valueAsNumber: true })}
                    />
                    <span className="text-[11px] text-zinc-400 w-4">g</span>
                  </div>
                  {/* Ratio preview */}
                  {recipeOutputGrams > 0 && (
                    <span className="w-10 shrink-0 text-right text-[11px] text-zinc-400 tabular-nums">
                      {recipeOutputGrams > 0
                        ? `${((Number(recipeItems[index]?.gramsPerUnit) || 0) / recipeOutputGrams * 100).toFixed(0)}%`
                        : ""}
                    </span>
                  )}
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="shrink-0 rounded p-1 text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ rbProductId: "", gramsPerUnit: 0 })}
              className="h-7 gap-1 text-xs text-zinc-600 border-dashed border-zinc-300"
            >
              <Plus size={11} /> Tambah Bahan
            </Button>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-600">Catatan Resep (opsional)</Label>
            <Input placeholder="Instruksi, variasi, dll." className="h-8 bg-white text-sm" {...register("recipeNotes")} />
          </div>
        </div>
      )}

      <button type="submit" className="hidden" disabled={isSubmitting} />
    </form>
  );
}