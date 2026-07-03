"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatKg, formatRupiah, formatUnit } from "@/lib/format";
import {
  createProductionBatch,
  type FGProductOption,
  type RBStockOption,
  type PackagingOption,
} from "../actions";

// =============================================================================
// Zod schema
// =============================================================================

const rbComponentSchema = z.object({
  productId:   z.string().min(1, "Pilih RB"),
  productName: z.string(),
  actualGrams: z.number().positive("> 0"),
});

const schema = z.object({
  outputProductId: z.string().min(1, "Wajib pilih produk"),
  recipeId:        z.string().optional(),
  packagingId:     z.string().min(1, "Wajib pilih kemasan"),
  unitsProduced:   z.number().int().positive("Minimal 1 unit"),
  rbComponents:    z.array(rbComponentSchema).min(1, "Minimal 1 komponen RB"),
  notes:           z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// =============================================================================
// Field helpers
// =============================================================================

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500">{message}</p>;
}

// =============================================================================
// HPP preview (bottom summary)
// =============================================================================

function HppSummary({
  rbComponents,
  rbOptions,
  packagingOptions,
  packagingId,
  unitsProduced,
}: {
  rbComponents: Array<{ productId: string; actualGrams: number }>;
  rbOptions: RBStockOption[];
  packagingOptions: PackagingOption[];
  packagingId: string;
  unitsProduced: number;
}) {
  if (unitsProduced < 1) return null;

  const totalRbGrams = rbComponents.reduce((s, c) => s + (Number(c.actualGrams) || 0), 0);
  const pkg = packagingOptions.find((p) => p.id === packagingId);

  // Simplified HPP preview (tidak bisa hitung HPP RB yang akurat di client karena butuh DB;
  // tampilkan total komponen saja sebagai konfirmasi bahan)
  return (
    <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        Ringkasan Produksi
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-zinc-500">Unit diproduksi</span>
        <span className="font-semibold text-zinc-900 text-right">{formatUnit(unitsProduced)}</span>
        <span className="text-zinc-500">Total RB digunakan</span>
        <span className="font-semibold text-zinc-900 text-right">{formatKg(totalRbGrams / 1000)}</span>
        <span className="text-zinc-500">Rata-rata RB/unit</span>
        <span className="font-semibold text-zinc-900 text-right">
          {unitsProduced > 0
            ? `${(totalRbGrams / unitsProduced).toFixed(1)} g`
            : "—"}
        </span>
        {pkg && (
          <>
            <span className="text-zinc-500">Kemasan</span>
            <span className="font-semibold text-zinc-900 text-right">{pkg.name}</span>
            <span className="text-zinc-500">Stok kemasan tersedia</span>
            <span className={`font-semibold text-right ${pkg.stockUnit < unitsProduced ? "text-red-600" : "text-zinc-900"}`}>
              {formatUnit(pkg.stockUnit)}
              {pkg.stockUnit < unitsProduced && " ⚠"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Props
// =============================================================================

interface ProductionFormProps {
  id: string;
  fgOptions: FGProductOption[];
  rbOptions: RBStockOption[];
  packagingOptions: PackagingOption[];
  onSuccess: () => void;
  onPendingChange: (pending: boolean) => void;
}

// =============================================================================
// Component
// =============================================================================

export function ProductionForm({
  id,
  fgOptions,
  rbOptions,
  packagingOptions,
  onSuccess,
  onPendingChange,
}: ProductionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      outputProductId: "",
      recipeId:        "",
      packagingId:     "",
      unitsProduced:   1,
      rbComponents:    [{ productId: "", productName: "", actualGrams: 0 }],
      notes:           "",
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "rbComponents",
  });

  const [outputProductId, unitsProduced, packagingId, rbComponents] = watch([
    "outputProductId",
    "unitsProduced",
    "packagingId",
    "rbComponents",
  ]);

  // ── Auto-fill dari resep saat user pilih FG ──
  useEffect(() => {
    if (!outputProductId) return;

    const fg = fgOptions.find((f) => f.id === outputProductId);
    if (!fg?.recipe) return;

    const recipe = fg.recipe;
    const units = Number(unitsProduced) || 1;

    // Set packaging default dari resep
    setValue("packagingId", recipe.packagingId);
    setValue("recipeId", recipe.id);

    // Set komponen RB dengan saran gramasi = gramsPerUnit × units
    if (recipe.items.length > 0) {
      replace(
        recipe.items.map((item) => ({
          productId:   item.productId,
          productName: item.productName,
          actualGrams: Math.round(item.gramsPerUnit * units),
        }))
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputProductId]);

  // ── Recalculate gramasi saat units berubah (jika masih dari resep) ──
  useEffect(() => {
    if (!outputProductId) return;
    const fg = fgOptions.find((f) => f.id === outputProductId);
    if (!fg?.recipe) return;

    const units = Number(unitsProduced) || 1;
    const recipe = fg.recipe;

    // Hanya recalc jika jumlah komponen sama dengan resep (user belum edit struktur)
    if (fields.length === recipe.items.length) {
      recipe.items.forEach((item, i) => {
        setValue(`rbComponents.${i}.actualGrams`, Math.round(item.gramsPerUnit * units));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitsProduced]);

  // ── Submit ──
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    onPendingChange(true);
    try {
      const result = await createProductionBatch({
        outputProductId: values.outputProductId,
        recipeId:        values.recipeId || undefined,
        packagingId:     values.packagingId,
        unitsProduced:   values.unitsProduced,
        rbComponents:    values.rbComponents.map((c) => ({
          productId:   c.productId,
          productName: c.productName,
          actualGrams: c.actualGrams,
        })),
        notes: values.notes,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`Batch produksi dicatat — ${result.batchCode}`);
      reset();
      onSuccess();
    } catch {
      toast.error("Terjadi kesalahan sistem. Coba lagi.");
    } finally {
      setIsSubmitting(false);
      onPendingChange(false);
    }
  };

  const selectedFG = fgOptions.find((f) => f.id === outputProductId);

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── Produk Jadi ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">
          Produk Jadi (SKU) <span className="text-red-500">*</span>
        </Label>
        <Controller
          control={control}
          name="outputProductId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(val: string | null) => field.onChange(val ?? "")}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Pilih SKU Finished Goods..." />
              </SelectTrigger>
              <SelectContent>
                {fgOptions.length === 0 ? (
                  <SelectItem value="_empty" disabled>Belum ada produk FG</SelectItem>
                ) : (
                  fgOptions.map((fg) => (
                    <SelectItem key={fg.id} value={fg.id}>
                      {fg.name}
                      {fg.recipe && (
                        <span className="ml-1 text-zinc-400">✓ resep</span>
                      )}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
        {selectedFG?.recipe && (
          <p className="text-xs text-emerald-600">
            ✓ Resep "{selectedFG.recipe.items.map((i) => i.productName).join(" + ")}" dimuat otomatis. Gramasi bisa diedit bebas.
          </p>
        )}
        {selectedFG && !selectedFG.recipe && (
          <p className="text-xs text-amber-600">
            Produk ini belum memiliki resep. Tambahkan komponen RB secara manual.
          </p>
        )}
        <FieldError message={errors.outputProductId?.message} />
      </FieldGroup>

      {/* ── Jumlah Unit ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">
          Jumlah Unit Diproduksi <span className="text-red-500">*</span>
        </Label>
        <Input
          type="number"
          step="1"
          min="1"
          placeholder="1"
          className="h-9 tabular-nums"
          {...register("unitsProduced", { valueAsNumber: true })}
        />
        <FieldError message={errors.unitsProduced?.message} />
      </FieldGroup>

      <Separator className="bg-zinc-100" />

      {/* ── Komponen Roasted Bean ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium text-zinc-700">
            Komponen Roasted Bean <span className="text-red-500">*</span>
          </Label>
          <button
            type="button"
            onClick={() => append({ productId: "", productName: "", actualGrams: 0 })}
            className="flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
          >
            <Plus size={11} /> Tambah
          </button>
        </div>

        {typeof errors.rbComponents?.message === "string" && (
          <FieldError message={errors.rbComponents.message} />
        )}

        <div className="space-y-2">
          {fields.map((field, index) => {
            const comp = rbComponents?.[index];
            const selectedRB = rbOptions.find((r) => r.id === comp?.productId);
            const neededKg = (Number(comp?.actualGrams) || 0) / 1000;
            const isOverStock = selectedRB ? neededKg > selectedRB.stockKg : false;

            return (
              <div
                key={field.id}
                className="flex items-start gap-2 rounded-lg border border-zinc-100 bg-zinc-50 p-3"
              >
                {/* Pilih RB */}
                <div className="flex-1 space-y-1">
                  <Controller
                    control={control}
                    name={`rbComponents.${index}.productId`}
                    render={({ field: f }) => (
                      <Select
                        value={f.value}
                        onValueChange={(val: string | null) => {
                          const v = val ?? "";
                          f.onChange(v);
                          const rb = rbOptions.find((r) => r.id === v);
                          setValue(`rbComponents.${index}.productName`, rb?.name ?? "");
                        }}
                      >
                        <SelectTrigger className="h-8 bg-white text-xs">
                          <SelectValue placeholder="Pilih Roasted Bean..." />
                        </SelectTrigger>
                        <SelectContent>
                          {rbOptions.length === 0 ? (
                            <SelectItem value="_empty" disabled>Tidak ada RB tersedia</SelectItem>
                          ) : (
                            rbOptions.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name}
                                {r.roastLevel ? ` · ${r.roastLevel.replace("_", " ")}` : ""}
                                {" "}
                                <span className="text-zinc-400">({formatKg(r.stockKg)})</span>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {selectedRB && (
                    <p className={`text-[10px] ${isOverStock ? "text-red-500" : "text-zinc-400"}`}>
                      Stok: {formatKg(selectedRB.stockKg)}
                      {isOverStock && " — ⚠ melebihi stok"}
                    </p>
                  )}
                </div>

                {/* Gram input */}
                <div className="w-28 space-y-1">
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="gram"
                    className="h-8 bg-white text-right tabular-nums text-sm"
                    {...register(`rbComponents.${index}.actualGrams`, { valueAsNumber: true })}
                  />
                  <p className="text-[10px] text-zinc-400 text-right">gram</p>
                </div>

                {/* Hapus baris */}
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-1 rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="bg-zinc-100" />

      {/* ── Kemasan ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">
          Kemasan <span className="text-red-500">*</span>
        </Label>
        <Controller
          control={control}
          name="packagingId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(val: string | null) => field.onChange(val ?? "")}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Pilih kemasan..." />
              </SelectTrigger>
              <SelectContent>
                {packagingOptions.length === 0 ? (
                  <SelectItem value="_empty" disabled>Tidak ada kemasan tersedia</SelectItem>
                ) : (
                  packagingOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      {" "}
                      <span className="text-zinc-400">
                        ({formatUnit(p.stockUnit)} · {formatRupiah(p.costPerUnit)}/pcs)
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.packagingId?.message} />
      </FieldGroup>

      {/* ── Ringkasan ── */}
      <HppSummary
        rbComponents={rbComponents ?? []}
        rbOptions={rbOptions}
        packagingOptions={packagingOptions}
        packagingId={packagingId ?? ""}
        unitsProduced={Number(unitsProduced) || 0}
      />

      {/* ── Catatan ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">Catatan (opsional)</Label>
        <Textarea
          placeholder="Batch notes, variasi blend, dll."
          rows={2}
          className="resize-none text-sm"
          {...register("notes")}
        />
      </FieldGroup>

      <button type="submit" className="hidden" aria-hidden disabled={isSubmitting} />
    </form>
  );
}
