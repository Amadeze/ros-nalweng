"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRupiah, calcHppPerKg } from "@/lib/format";
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
  });

type FormValues = z.infer<typeof schema>;

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
      <Label className="text-xs font-medium text-zinc-600">{label}</Label>
      <div className="flex h-8 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3">
        <span className="text-sm font-semibold text-zinc-900">{value}</span>
      </div>
      {hint && <p className="text-xs text-zinc-400">{hint}</p>}
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
  const today = new Date().toISOString().split("T")[0];
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
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ── Supplier ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">
          Supplier <span className="text-red-500">*</span>
        </Label>
        <Controller
          control={control}
          name="supplierId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(val: string | null) => field.onChange(val ?? "")}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Pilih supplier..." />
              </SelectTrigger>
              <SelectContent>
                {suppliers.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    Belum ada supplier
                  </SelectItem>
                ) : (
                  suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.supplierId?.message} />
      </FieldGroup>

      {/* ── Tanggal ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">
          Tanggal Terima <span className="text-red-500">*</span>
        </Label>
        <Input
          type="date"
          className="h-9"
          {...register("receivedAt")}
        />
        <FieldError message={errors.receivedAt?.message} />
      </FieldGroup>

      <Separator className="bg-zinc-100" />

      {/* ── Mode produk ── */}
      <div>
        <Label className="text-xs font-medium text-zinc-700 mb-2 block">
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
                  className={`flex-1 rounded-md border py-1.5 text-xs font-medium transition-colors ${
                    field.value === mode
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
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
          <Label className="text-xs font-medium text-zinc-700">Pilih Green Bean</Label>
          <Controller
            control={control}
            name="productId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val: string | null) => field.onChange(val ?? "")}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Pilih produk..." />
                </SelectTrigger>
                <SelectContent>
                  {gbProducts.length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      Belum ada produk GB
                    </SelectItem>
                  ) : (
                    gbProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                        {p.origin ? ` — ${p.origin}` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.productId?.message} />
        </FieldGroup>
      )}

      {/* ── Produk baru ── */}
      {productMode === "new" && (
        <div className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
          <FieldGroup>
            <Label className="text-xs font-medium text-zinc-700">
              Nama Green Bean <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Gayo Natural, Ethiopia Yirgacheffe"
              className="h-9 bg-white"
              {...register("productName")}
            />
            <FieldError message={errors.productName?.message} />
          </FieldGroup>
          <FieldGroup>
            <Label className="text-xs font-medium text-zinc-700">Asal / Origin</Label>
            <Input
              placeholder="e.g. Aceh, Ethiopia, Flores"
              className="h-9 bg-white"
              {...register("productOrigin")}
            />
          </FieldGroup>
        </div>
      )}

      <Separator className="bg-zinc-100" />

      {/* ── Berat & Harga ── */}
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label className="text-xs font-medium text-zinc-700">
            Berat (kg) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step="0.001"
            min="0"
            placeholder="0.000"
            className="h-9 tabular-nums"
            {...register("weightKg", { valueAsNumber: true })}
          />
          <FieldError message={errors.weightKg?.message} />
        </FieldGroup>

        <FieldGroup>
          <Label className="text-xs font-medium text-zinc-700">
            Harga Beli /kg <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step="1"
            min="0"
            placeholder="0"
            className="h-9 tabular-nums"
            {...register("pricePerKg", { valueAsNumber: true })}
          />
          <FieldError message={errors.pricePerKg?.message} />
        </FieldGroup>
      </div>

      {/* ── Ongkir ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">Ongkos Kirim (total)</Label>
        <Input
          type="number"
          step="1"
          min="0"
          placeholder="0"
          className="h-9 tabular-nums"
          {...register("shippingCost", { valueAsNumber: true })}
        />
        <FieldError message={errors.shippingCost?.message} />
      </FieldGroup>

      {/* ── HPP auto-computed ── */}
      <div className="grid grid-cols-2 gap-3">
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

      <Separator className="bg-zinc-100" />

      {/* ── Catatan ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">Catatan (opsional)</Label>
        <Textarea
          placeholder="Kualitas, kondisi saat tiba, dll."
          rows={3}
          className="resize-none text-sm"
          {...register("notes")}
        />
      </FieldGroup>

      {/* Hidden submit — dipanggil via tombol di drawer footer */}
      <button type="submit" className="hidden" aria-hidden disabled={isSubmitting} />
    </form>
  );
}
