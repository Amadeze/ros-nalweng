"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, CreditCard, Banknote, QrCode, Clock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatRupiah } from "@/lib/format";
import { createInvoice, type CustomerOption, type FGStockOption } from "../actions";

// =============================================================================
// Schema
// =============================================================================

const itemSchema = z.object({
  productId:  z.string().min(1, "Pilih produk"),
  quantity:   z.number().int().min(1, "Min 1"),
  unitPrice:  z.number().min(1, "Harga > 0"),
  discount:   z.number().min(0),
});

const schema = z.object({
  customerId:      z.string().min(1, "Wajib pilih customer"),
  items:           z.array(itemSchema).min(1, "Minimal 1 item"),
  invoiceDiscount: z.number().min(0),
  tax:             z.number().min(0),
  status:          z.enum(["PAID", "ISSUED"]),
  paymentMethod:   z.string().optional(),
  dueDate:         z.string().optional(),
  notes:           z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// =============================================================================
// Helpers
// =============================================================================

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1.5">{children}</div>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-0.5 text-xs text-red-500">{message}</p>;
}

// =============================================================================
// Payment Method Selector
// =============================================================================

const PAYMENT_METHODS = [
  { value: "CASH",     label: "Cash",     icon: Banknote },
  { value: "TRANSFER", label: "Transfer", icon: CreditCard },
  { value: "QRIS",     label: "QRIS",     icon: QrCode },
  { value: "CREDIT",   label: "Piutang",  icon: Clock },
];

function PaymentMethodGroup({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PAYMENT_METHODS.map((m) => {
        const Icon = m.icon;
        const active = value === m.value;
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            className={[
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
              active
                ? "border-zinc-800 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50",
            ].join(" ")}
          >
            <Icon size={12} />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// Totals Summary
// =============================================================================

function TotalsSummary({
  subtotal,
  invoiceDiscount,
  tax,
  grandTotal,
}: {
  subtotal: number;
  invoiceDiscount: number;
  tax: number;
  grandTotal: number;
}) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 space-y-1.5">
      <div className="flex justify-between text-xs text-zinc-500">
        <span>Subtotal</span>
        <span className="font-mono">{formatRupiah(subtotal)}</span>
      </div>
      {invoiceDiscount > 0 && (
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Diskon Nota</span>
          <span className="font-mono text-red-600">- {formatRupiah(invoiceDiscount)}</span>
        </div>
      )}
      {tax > 0 && (
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Pajak</span>
          <span className="font-mono">{formatRupiah(tax)}</span>
        </div>
      )}
      <Separator className="bg-zinc-200" />
      <div className="flex justify-between text-sm font-semibold text-zinc-900">
        <span>Grand Total</span>
        <span className="font-mono text-base">{formatRupiah(grandTotal)}</span>
      </div>
    </div>
  );
}

// =============================================================================
// Props
// =============================================================================

interface InvoiceFormProps {
  id: string;
  customers: CustomerOption[];
  fgOptions: FGStockOption[];
  onSuccess: (invoiceId: string) => void;
  onPendingChange: (pending: boolean) => void;
}

// =============================================================================
// Component
// =============================================================================

export function InvoiceForm({
  id,
  customers,
  fgOptions,
  onSuccess,
  onPendingChange,
}: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

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
      customerId:      "",
      items:           [{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }],
      invoiceDiscount: 0,
      tax:             0,
      status:          "PAID",
      paymentMethod:   "CASH",
      dueDate:         "",
      notes:           "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const [watchedItems, invoiceDiscount, tax, status, paymentMethod] = watch([
    "items",
    "invoiceDiscount",
    "tax",
    "status",
    "paymentMethod",
  ]);

  // Live calculations
  const itemSubtotals = (watchedItems ?? []).map((item) => {
    const price = Number(item.unitPrice) || 0;
    const disc  = Number(item.discount)  || 0;
    const qty   = Number(item.quantity)  || 0;
    return (price - disc) * qty;
  });
  const subtotal   = itemSubtotals.reduce((s, v) => s + v, 0);
  const grandTotal = subtotal - (Number(invoiceDiscount) || 0) + (Number(tax) || 0);

  // ── Submit ──
  const onSubmit = async (values: FormValues) => {
    // Manual cross-field validation
    if (values.status === "PAID" && !values.paymentMethod) {
      toast.error("Pilih metode pembayaran terlebih dahulu.");
      return;
    }
    if (values.status === "ISSUED" && !values.dueDate) {
      toast.error("Isi tanggal jatuh tempo untuk nota Tempo.");
      return;
    }

    setIsSubmitting(true);
    onPendingChange(true);
    try {
      const result = await createInvoice({
        customerId:      values.customerId,
        items:           values.items as { productId: string; quantity: number; unitPrice: number; discount: number }[],
        invoiceDiscount: values.invoiceDiscount,
        tax:             values.tax,
        status:          values.status,
        paymentMethod:   values.paymentMethod as "CASH" | "TRANSFER" | "QRIS" | "CREDIT" | undefined,
        dueDate:         values.dueDate || undefined,
        notes:           values.notes,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`Nota ${result.invoiceCode} berhasil diterbitkan!`);
      reset();
      onSuccess(result.invoiceId);
    } catch {
      toast.error("Terjadi kesalahan sistem. Coba lagi.");
    } finally {
      setIsSubmitting(false);
      onPendingChange(false);
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── Customer ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">
          Customer <span className="text-red-500">*</span>
        </Label>
        <Controller
          control={control}
          name="customerId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(val: string | null) => field.onChange(val ?? "")}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Pilih customer..." />
              </SelectTrigger>
              <SelectContent>
                {customers.length === 0 ? (
                  <SelectItem value="_empty" disabled>Belum ada customer</SelectItem>
                ) : (
                  customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.phone && <span className="ml-1 text-zinc-400">· {c.phone}</span>}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.customerId?.message} />
      </FieldGroup>

      <Separator className="bg-zinc-100" />

      {/* ── Item Rows ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium text-zinc-700">
            Item Penjualan <span className="text-red-500">*</span>
          </Label>
          <button
            type="button"
            onClick={() => append({ productId: "", quantity: 1, unitPrice: 0, discount: 0 })}
            className="flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
          >
            <Plus size={11} /> Tambah Baris
          </button>
        </div>
        {typeof errors.items?.message === "string" && (
          <FieldError message={errors.items.message} />
        )}

        {/* Column header */}
        <div className="mb-1 grid grid-cols-[1fr_56px_88px_72px_80px_20px] gap-1 px-1">
          {["Produk", "Qty", "Harga", "Disc/unit", "Subtotal", ""].map((h) => (
            <p key={h} className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
              {h}
            </p>
          ))}
        </div>

        <div className="space-y-1.5">
          {fields.map((field, index) => {
            const item       = watchedItems?.[index];
            const price      = Number(item?.unitPrice) || 0;
            const disc       = Number(item?.discount) || 0;
            const qty        = Number(item?.quantity) || 0;
            const rowSub     = (price - disc) * qty;
            const selProd    = fgOptions.find((f) => f.id === item?.productId);
            const overStock  = selProd ? qty > selProd.stockUnit : false;

            return (
              <div key={field.id} className="grid grid-cols-[1fr_56px_88px_72px_80px_20px] items-start gap-1">
                {/* Product select */}
                <div>
                  <Controller
                    control={control}
                    name={`items.${index}.productId`}
                    render={({ field: f }) => (
                      <Select
                        value={f.value}
                        onValueChange={(val: string | null) => {
                          const v = val ?? "";
                          f.onChange(v);
                          const fg = fgOptions.find((p) => p.id === v);
                          // Pre-fill unit price with HPP as reference (cashier adjusts)
                          if (fg?.lastHppPerUnit) {
                            setValue(`items.${index}.unitPrice`, Math.round(fg.lastHppPerUnit));
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs truncate">
                          <SelectValue placeholder="Pilih produk..." />
                        </SelectTrigger>
                        <SelectContent>
                          {fgOptions.length === 0 ? (
                            <SelectItem value="_empty" disabled>Tidak ada FG tersedia</SelectItem>
                          ) : (
                            fgOptions.map((fg) => (
                              <SelectItem key={fg.id} value={fg.id}>
                                {fg.name}
                                {" "}
                                <span className={fg.stockUnit === 0 ? "text-red-400" : "text-zinc-400"}>
                                  ({fg.stockUnit} unit)
                                </span>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {overStock && (
                    <p className="mt-0.5 text-[10px] text-red-500">
                      ⚠ Stok hanya {selProd?.stockUnit} unit
                    </p>
                  )}
                </div>

                {/* Qty */}
                <Input
                  type="number"
                  step="1"
                  min="1"
                  className="h-8 text-center tabular-nums text-sm"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />

                {/* Unit Price */}
                <Input
                  type="number"
                  step="1"
                  min="0"
                  className="h-8 text-right tabular-nums text-sm"
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                />

                {/* Disc per unit */}
                <Input
                  type="number"
                  step="1"
                  min="0"
                  className="h-8 text-right tabular-nums text-sm"
                  {...register(`items.${index}.discount`, { valueAsNumber: true })}
                />

                {/* Row subtotal */}
                <p className="flex h-8 items-center justify-end font-mono text-xs font-semibold text-zinc-800">
                  {formatRupiah(rowSub)}
                </p>

                {/* Delete */}
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="flex h-8 items-center justify-center rounded text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="bg-zinc-100" />

      {/* ── Invoice Level Discount & Tax ── */}
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label className="text-xs font-medium text-zinc-700">Diskon Nota (Rp)</Label>
          <Input
            type="number"
            step="1"
            min="0"
            placeholder="0"
            className="h-9 text-right tabular-nums"
            {...register("invoiceDiscount", { valueAsNumber: true })}
          />
        </FieldGroup>
        <FieldGroup>
          <Label className="text-xs font-medium text-zinc-700">Pajak (Rp)</Label>
          <Input
            type="number"
            step="1"
            min="0"
            placeholder="0"
            className="h-9 text-right tabular-nums"
            {...register("tax", { valueAsNumber: true })}
          />
        </FieldGroup>
      </div>

      {/* ── Totals ── */}
      <TotalsSummary
        subtotal={subtotal}
        invoiceDiscount={Number(invoiceDiscount) || 0}
        tax={Number(tax) || 0}
        grandTotal={grandTotal}
      />

      <Separator className="bg-zinc-100" />

      {/* ── Status (Lunas / Tempo) ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">
          Status Pembayaran <span className="text-red-500">*</span>
        </Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <div className="flex gap-2">
              {(["PAID", "ISSUED"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    field.onChange(s);
                    if (s === "PAID") setValue("dueDate", "");
                    if (s === "ISSUED") setValue("paymentMethod", undefined);
                  }}
                  className={[
                    "flex-1 rounded-lg border py-2 text-sm font-semibold transition-all",
                    field.value === s
                      ? s === "PAID"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50",
                  ].join(" ")}
                >
                  {s === "PAID" ? "✓ Lunas" : "⏱ Tempo"}
                </button>
              ))}
            </div>
          )}
        />
      </FieldGroup>

      {/* ── Payment Method (if PAID) ── */}
      {status === "PAID" && (
        <FieldGroup>
          <Label className="text-xs font-medium text-zinc-700">
            Metode Pembayaran <span className="text-red-500">*</span>
          </Label>
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field }) => (
              <PaymentMethodGroup
                value={field.value ?? "CASH"}
                onChange={field.onChange}
              />
            )}
          />
        </FieldGroup>
      )}

      {/* ── Due Date (if ISSUED) ── */}
      {status === "ISSUED" && (
        <FieldGroup>
          <Label className="text-xs font-medium text-zinc-700">
            Tanggal Jatuh Tempo <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            min={today}
            className="h-9"
            {...register("dueDate")}
          />
        </FieldGroup>
      )}

      {/* ── Notes ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">Catatan (opsional)</Label>
        <Textarea
          placeholder="Catatan pengiriman, kesepakatan khusus, dll."
          rows={2}
          className="resize-none text-sm"
          {...register("notes")}
        />
      </FieldGroup>

      <button type="submit" className="hidden" aria-hidden disabled={isSubmitting} />
    </form>
  );
}
