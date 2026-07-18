"use client";

import { useForm, Controller } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PurchasePaymentSection } from "./PurchasePaymentSection";
import { formatRupiah, calcHppPerKg } from "@/lib/format";
import { getTodayString } from "@/lib/date-utils";
import {
  createGreenBeanPurchase,
  type SupplierOption,
  type GBProductOption,
} from "../actions";

// =============================================================================
// Zod schema
// =============================================================================

const schema = z
  .object({
    supplierId: z.string().min(1, "Wajib pilih supplier"),
    receivedAt: z.string().min(1, "Tanggal wajib diisi"),
    productMode: z.enum(["existing", "new"]),
    productId: z.string().optional(),
    productName: z.string().optional(),
    productOrigin: z.string().optional(),
    // z.number() + valueAsNumber:true in register — react-hook-form converts input string to number
    weightKg: z.number().positive("Harus lebih dari 0"),
    pricePerKg: z.number().positive("Harus lebih dari 0"),
    shippingCost: z.number().min(0, "Tidak boleh negatif"),
    paymentStatus: z.enum(["PAID", "PARTIAL", "UNPAID"]),
    initialPaidAmount: z.number().min(0).optional(),
    paymentMethod: z.enum(["CASH", "TRANSFER", "QRIS"]),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.productMode === "existing" && !data.productId) {
      ctx.addIssue({
        code: "custom",
        path: ["productId"],
        message: "Wajib pilih produk",
      });
    }
    if (data.productMode === "new") {
      if (!data.productName || data.productName.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["productName"],
          message: "Nama minimal 2 karakter",
        });
      }
    }
    const totalCost = data.pricePerKg * data.weightKg + data.shippingCost;
    if (data.paymentStatus === "PARTIAL") {
      if (!data.initialPaidAmount || data.initialPaidAmount >= totalCost) {
        ctx.addIssue({
          code: "custom",
          path: ["initialPaidAmount"],
          message: "Uang muka harus lebih dari 0 dan lebih kecil dari total",
        });
      }
    }
    if (data.paymentStatus !== "PAID" && !data.dueDate) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Tanggal jatuh tempo wajib diisi",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

const glassInput = "bg-white/40 border-white/60 backdrop-blur-md transition-all focus:bg-white/60 focus:border-white/80";
const glassCard = "rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl p-4 shadow-sm";

// =============================================================================
// Field wrapper helpers
// =============================================================================

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500">{message}</p>;
}

function ReadonlyField({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <FieldGroup>
      <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{label}</Label>
      <div className={cn("flex h-9 items-center px-3 cursor-not-allowed opacity-80", glassInput)}>
        <span className="text-sm font-semibold text-slate-800">{value}</span>
      </div>
      {hint && <p className="text-[10px] font-medium text-slate-400">{hint}</p>}
    </FieldGroup>
  );
}

// =============================================================================
// Props
// =============================================================================

interface PurchaseFormProps {
  id: string;
  suppliers: SupplierOption[];
  gbProducts: GBProductOption[];
  onSuccess: () => void;
  onPendingChange: (pending: boolean) => void;
}

// =============================================================================
// Component
// =============================================================================

export function PurchaseForm({
  id,
  suppliers,
  gbProducts,
  onSuccess,
  onPendingChange,
}: PurchaseFormProps) {
  const today = getTodayString();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId: "",
      receivedAt: today,
      productMode: gbProducts.length > 0 ? "existing" : "new",
      productId: "",
      productName: "",
      productOrigin: "",
      weightKg: 0,
      pricePerKg: 0,
      shippingCost: 0,
      paymentStatus: "PAID",
      initialPaidAmount: 0,
      paymentMethod: "CASH",
      dueDate: "",
      notes: "",
    },
  });

  // Live HPP computation
  const [weightKg, pricePerKg, shippingCost] = watch([
    "weightKg",
    "pricePerKg",
    "shippingCost",
  ]);
  const productMode = watch("productMode");
  const paymentStatus = watch("paymentStatus");

  const hppPerKg = calcHppPerKg(
    Number(pricePerKg) || 0,
    Number(weightKg) || 0,
    Number(shippingCost) || 0
  );

  const totalCost =
    (Number(pricePerKg) || 0) * (Number(weightKg) || 0) +
    (Number(shippingCost) || 0);

  // ── Submit ──
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    onPendingChange(true);
    try {
      const result = await createGreenBeanPurchase({
        supplierId: values.supplierId,
        receivedAt: values.receivedAt,
        productId: values.productMode === "existing" ? values.productId : undefined,
        productName: values.productMode === "new" ? values.productName : undefined,
        productOrigin: values.productMode === "new" ? values.productOrigin : undefined,
        weightKg: values.weightKg,
        pricePerKg: values.pricePerKg,
        shippingCost: values.shippingCost,
        paymentStatus: values.paymentStatus,
        initialPaidAmount: values.initialPaidAmount,
        paymentMethod: values.paymentMethod,
        dueDate: values.dueDate,
        notes: values.notes,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`Barang datang dicatat — ${result.purchaseCode}`);
      reset();
      onSuccess();
    } catch {
      toast.error("Terjadi kesalahan sistem. Coba lagi.");
    } finally {
      setIsSubmitting(false);
      onPendingChange(false);
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative">
      {/* ── Supplier ── */}
      <FieldGroup>
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Supplier <span className="text-red-500">*</span>
        </Label>
        <select
          className={cn(
            "w-full h-9 rounded-lg border px-3 text-sm transition-all appearance-none outline-none",
            glassInput,
            errors.supplierId ? "border-red-500 ring-2 ring-red-500/20" : ""
          )}
          {...register("supplierId")}
        >
          <option value="" disabled>Pilih supplier...</option>
          {suppliers.length === 0 ? (
            <option value="_empty" disabled>Belum ada supplier</option>
          ) : (
            suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))
          )}
        </select>
        <FieldError message={errors.supplierId?.message} />
      </FieldGroup>

      {/* ── Tanggal ── */}
      <FieldGroup>
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Tanggal Terima <span className="text-red-500">*</span>
        </Label>
        <Input
          type="date"
          className={cn("h-9", glassInput)}
          {...register("receivedAt")}
        />
        <FieldError message={errors.receivedAt?.message} />
      </FieldGroup>

      <Separator className="bg-white/50" />

      {/* ── Mode produk ── */}
      <div>
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2 block">
          Green Bean <span className="text-red-500">*</span>
        </Label>
        <Controller
          control={control}
          name="productMode"
          render={({ field }) => (
            <div className="flex gap-2">
              {(["existing", "new"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => field.onChange(mode)}
                  className={cn(
                    "flex-1 rounded-xl border py-2 text-xs font-bold transition-all shadow-sm",
                    field.value === mode
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md ring-2 ring-blue-500/20 ring-offset-1"
                      : "border-white/60 bg-white/40 text-slate-500 hover:bg-white/60"
                  )}
                >
                  {mode === "existing" ? "Produk Existing" : "+ Produk Baru"}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {/* ── Pilih existing ── */}
      {productMode === "existing" && (
        <FieldGroup>
          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Pilih Green Bean</Label>
          <select
            className={cn(
              "w-full h-9 rounded-lg border px-3 text-sm transition-all appearance-none outline-none",
              glassInput,
              errors.productId ? "border-red-500 ring-2 ring-red-500/20" : ""
            )}
            {...register("productId")}
          >
            <option value="" disabled>Pilih produk...</option>
            {gbProducts.length === 0 ? (
              <option value="_empty" disabled>Belum ada produk GB</option>
            ) : (
              gbProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.origin ? ` — ${p.origin}` : ""}
                </option>
              ))
            )}
          </select>
          <FieldError message={errors.productId?.message} />
        </FieldGroup>
      )}

      {/* ── Produk baru ── */}
      {productMode === "new" && (
        <div className={cn(glassCard, "space-y-4")}>
          <FieldGroup>
            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Nama Green Bean <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Gayo Natural, Ethiopia Yirgacheffe"
              className={cn("h-9 font-medium", glassInput)}
              {...register("productName")}
            />
            <FieldError message={errors.productName?.message} />
          </FieldGroup>
          <FieldGroup>
            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Asal / Origin</Label>
            <Input
              placeholder="e.g. Aceh, Ethiopia, Flores"
              className={cn("h-9", glassInput)}
              {...register("productOrigin")}
            />
          </FieldGroup>
        </div>
      )}

      <Separator className="bg-white/50" />

      {/* ── Berat & Harga ── */}
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Berat (kg) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step="0.001"
            min="0"
            placeholder="0.000"
            className={cn("h-9 tabular-nums font-semibold", glassInput)}
            {...register("weightKg", { valueAsNumber: true })}
          />
          <FieldError message={errors.weightKg?.message} />
        </FieldGroup>

        <FieldGroup>
          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Harga Beli /kg <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step="1"
            min="0"
            placeholder="0"
            className={cn("h-9 tabular-nums font-semibold", glassInput)}
            {...register("pricePerKg", { valueAsNumber: true })}
          />
          <FieldError message={errors.pricePerKg?.message} />
        </FieldGroup>
      </div>

      {/* ── Ongkir ── */}
      <FieldGroup>
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Ongkos Kirim (total)</Label>
        <Input
          type="number"
          step="1"
          min="0"
          placeholder="0"
          className={cn("h-9 tabular-nums", glassInput)}
          {...register("shippingCost", { valueAsNumber: true })}
        />
        <FieldError message={errors.shippingCost?.message} />
      </FieldGroup>

      {/* ── HPP auto-computed ── */}
      <div className="grid grid-cols-2 gap-4">
        <ReadonlyField
          label="Total Biaya"
          value={totalCost > 0 ? formatRupiah(totalCost) : "—"}
        />
        <ReadonlyField
          label="HPP /kg (otomatis)"
          value={hppPerKg > 0 ? formatRupiah(hppPerKg) : "—"}
          hint="(Harga × Berat + Ongkir) ÷ Berat"
        />
      </div>

      <PurchasePaymentSection
        register={register}
        errors={errors}
        paymentStatus={paymentStatus}
      />

      {/* Hidden submit — dipanggil via tombol di drawer footer */}
      <button type="submit" className="hidden" aria-hidden disabled={isSubmitting} />
    </form>
  );
}
