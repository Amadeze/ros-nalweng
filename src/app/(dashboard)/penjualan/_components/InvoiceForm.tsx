"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2, CreditCard, Banknote, QrCode, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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

import { formatRupiah } from "@/lib/format";
import { createInvoice, type CustomerOption, type FGStockOption } from "../actions";

// =============================================================================
// Schema
// =============================================================================
const itemSchema = z.object({
  productId: z.string().min(1, "Pilih produk"),
  quantity: z.number().int().min(1, "Minimal 1"),
  unitPrice: z.number().min(1, "Harga harus > 0"),
  discount: z.number().min(0),
});

const schema = z.object({
  customerId: z.string().min(1, "Wajib pilih customer"),
  items: z.array(itemSchema).min(1, "Minimal 1 item"),
  invoiceDiscount: z.number().min(0),
  tax: z.number().min(0),
  status: z.enum(["PAID", "ISSUED"]),
  paymentMethod: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// =============================================================================
// Styling
// =============================================================================
const glassInput = "bg-white/40 border-white/60 backdrop-blur-md transition-all focus:bg-white/60 focus:border-white/80";
const glassCard = "rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl p-4 shadow-sm";

// =============================================================================
// Helper Components
// =============================================================================
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "TRANSFER", label: "Transfer", icon: CreditCard },
  { value: "QRIS", label: "QRIS", icon: QrCode },
  { value: "CREDIT", label: "Piutang", icon: Clock },
];

function PaymentMethodGroup({ value, onChange }: { value: string; onChange: (val: string) => void }) {
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
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
              active
                ? "border-white/80 bg-white/90 text-slate-900 shadow-sm"
                : "border-white/40 bg-white/30 text-slate-700 hover:bg-white/50"
            )}
          >
            <Icon size={14} />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

function TotalsSummary({ subtotal, invoiceDiscount, tax, grandTotal }: any) {
  return (
    <div className={glassCard}>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-mono">{formatRupiah(subtotal)}</span>
        </div>
        {invoiceDiscount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Diskon Nota</span>
            <span className="font-mono">- {formatRupiah(invoiceDiscount)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Pajak</span>
            <span className="font-mono">{formatRupiah(tax)}</span>
          </div>
        )}
        <Separator className="bg-white/50" />
        <div className="flex justify-between text-base font-bold text-slate-800">
          <span>Grand Total</span>
          <span className="font-mono">{formatRupiah(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================
export function InvoiceForm({
  id,
  customers,
  fgOptions,
  onSuccess,
  onPendingChange,
}: {
  id: string;
  customers: CustomerOption[];
  fgOptions: FGStockOption[];
  onSuccess: (invoiceId: string) => void;
  onPendingChange: (pending: boolean) => void;
}) {
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
      customerId: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }],
      invoiceDiscount: 0,
      tax: 0,
      status: "PAID",
      paymentMethod: "CASH",
      dueDate: "",
      notes: "",
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

  const subtotal = (watchedItems ?? []).reduce((acc, item) => {
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discount) || 0;
    const qty = Number(item.quantity) || 0;
    return acc + (price - disc) * qty;
  }, 0);

  const grandTotal = subtotal - (Number(invoiceDiscount) || 0) + (Number(tax) || 0);

  const onSubmit = async (values: FormValues) => {
    // Cross-field validation
    if (values.status === "PAID" && !values.paymentMethod) {
      toast.error("Pilih metode pembayaran untuk nota Lunas.");
      return;
    }
    if (values.status === "ISSUED" && !values.dueDate) {
      toast.error("Tanggal jatuh tempo wajib diisi untuk nota Tempo.");
      return;
    }

    setIsSubmitting(true);
    onPendingChange(true);

    try {
      const result = await createInvoice({
        customerId: values.customerId,
        items: values.items as any,
        invoiceDiscount: values.invoiceDiscount,
        tax: values.tax,
        status: values.status,
        paymentMethod: values.paymentMethod as any,
        dueDate: values.dueDate || undefined,
        notes: values.notes,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`Nota ${result.invoiceCode || ""} berhasil diterbitkan!`);
      reset();
      onSuccess(result.invoiceId);
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
      onPendingChange(false);
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-slate-700">
          Customer <span className="text-red-500">*</span>
        </Label>
        <Controller
          control={control}
          name="customerId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className={glassInput}>
                <SelectValue placeholder="Pilih customer..." />
              </SelectTrigger>
              <SelectContent className="bg-white/90 backdrop-blur-xl">
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.phone && <span className="text-slate-400"> · {c.phone}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.customerId?.message} />
      </div>

      <Separator className="bg-white/50" />

      {/* Items */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label className="text-xs font-semibold text-slate-700">
            Item Penjualan <span className="text-red-500">*</span>
          </Label>
          <button
            type="button"
            onClick={() => append({ productId: "", quantity: 1, unitPrice: 0, discount: 0 })}
            className="flex items-center gap-1 rounded-lg border border-white/60 bg-white/30 px-3 py-1 text-xs hover:bg-white/50 transition-colors"
          >
            <Plus size={14} /> Tambah Baris
          </button>
        </div>

        {typeof errors.items?.message === "string" && (
          <FieldError message={errors.items.message} />
        )}

        {/* Header */}
        <div className="mb-2 grid grid-cols-[1fr_60px_90px_75px_90px_28px] gap-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {["Produk", "Qty", "Harga", "Disc", "Subtotal", ""].map((h) => (
            <div key={h}>{h}</div>
          ))}
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => {
            const item = watchedItems?.[index];
            const price = Number(item?.unitPrice) || 0;
            const disc = Number(item?.discount) || 0;
            const qty = Number(item?.quantity) || 0;
            const rowSubtotal = (price - disc) * qty;

            const selectedProduct = fgOptions.find((p) => p.id === item?.productId);
            const isOverStock = selectedProduct ? qty > selectedProduct.stockUnit : false;

            return (
              <div key={field.id} className="grid grid-cols-[1fr_60px_90px_75px_90px_28px] gap-2 items-start">
                <Controller
                  control={control}
                  name={`items.${index}.productId`}
                  render={({ field: f }) => (
                    <Select
                      value={f.value}
                      onValueChange={(val) => {
                        f.onChange(val);
                        const prod = fgOptions.find((p) => p.id === val);
                        if (prod?.lastHppPerUnit) {
                          setValue(`items.${index}.unitPrice`, Math.round(prod.lastHppPerUnit));
                        }
                      }}
                    >
                      <SelectTrigger className={glassInput}>
                        <SelectValue placeholder="Pilih produk..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white/90 backdrop-blur-xl">
                        {fgOptions.map((fg) => (
                          <SelectItem key={fg.id} value={fg.id}>
                            {fg.name} <span className="text-slate-400">({fg.stockUnit})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                <Input
                  type="number"
                  className={cn(glassInput, "text-center")}
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  className={cn(glassInput, "text-right")}
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  className={cn(glassInput, "text-right")}
                  {...register(`items.${index}.discount`, { valueAsNumber: true })}
                />

                <div className="flex h-10 items-center justify-end font-mono text-sm font-semibold text-slate-800">
                  {formatRupiah(rowSubtotal)}
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-400 hover:text-red-600 transition-colors mt-1"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice Discount & Tax */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-medium text-slate-700">Diskon Nota (Rp)</Label>
          <Input
            type="number"
            className={glassInput}
            {...register("invoiceDiscount", { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-slate-700">Pajak (Rp)</Label>
          <Input
            type="number"
            className={glassInput}
            {...register("tax", { valueAsNumber: true })}
          />
        </div>
      </div>

      <TotalsSummary
        subtotal={subtotal}
        invoiceDiscount={invoiceDiscount || 0}
        tax={tax || 0}
        grandTotal={grandTotal}
      />

      {/* Status */}
      <div>
        <Label className="text-xs font-medium text-slate-700 mb-2 block">
          Status Pembayaran <span className="text-red-500">*</span>
        </Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <div className="flex gap-3">
              {(["PAID", "ISSUED"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    field.onChange(s);
                    if (s === "PAID") setValue("dueDate", "");
                    if (s === "ISSUED") setValue("paymentMethod", undefined);
                  }}
                  className={cn(
                    "flex-1 py-3 rounded-xl border font-semibold transition-all",
                    field.value === s
                      ? s === "PAID"
                        ? "border-emerald-400 bg-emerald-50/80 text-emerald-700"
                        : "border-amber-400 bg-amber-50/80 text-amber-700"
                      : "border-white/60 bg-white/30 hover:bg-white/50"
                  )}
                >
                  {s === "PAID" ? "✓ Lunas" : "⏱ Tempo"}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {/* Payment Method */}
      {status === "PAID" && (
        <div>
          <Label className="text-xs font-medium text-slate-700 mb-2 block">
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
        </div>
      )}

      {/* Due Date */}
      {status === "ISSUED" && (
        <div>
          <Label className="text-xs font-medium text-slate-700">
            Tanggal Jatuh Tempo <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            min={today}
            className={glassInput}
            {...register("dueDate")}
          />
        </div>
      )}

      {/* Notes */}
      <div>
        <Label className="text-xs font-medium text-slate-700">Catatan (opsional)</Label>
        <Textarea
          placeholder="Catatan pengiriman, kesepakatan khusus, dll..."
          className={glassInput}
          rows={3}
          {...register("notes")}
        />
      </div>

      <button type="submit" className="hidden" disabled={isSubmitting} />
    </form>
  );
}