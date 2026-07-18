"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const glassInput = "bg-white/40 border-white/60 backdrop-blur-md transition-all focus:bg-white/60 focus:border-white/80";

interface PurchasePaymentSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  paymentStatus: string;
}

export function PurchasePaymentSection({
  register,
  errors,
  paymentStatus,
}: PurchasePaymentSectionProps) {
  return (
    <>
      <Separator className="bg-white/50" />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Status Pembayaran
          </Label>
          <select
            className={cn("w-full h-9 rounded-lg border px-3 text-sm outline-none", glassInput)}
            {...register("paymentStatus")}
          >
            <option value="PAID">Lunas</option>
            <option value="PARTIAL">Bayar Sebagian</option>
            <option value="UNPAID">Belum Dibayar</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Metode Pembayaran
          </Label>
          <select
            disabled={paymentStatus === "UNPAID"}
            className={cn(
              "w-full h-9 rounded-lg border px-3 text-sm outline-none disabled:opacity-50",
              glassInput
            )}
            {...register("paymentMethod")}
          >
            <option value="CASH">Tunai</option>
            <option value="TRANSFER">Transfer</option>
            <option value="QRIS">QRIS</option>
          </select>
        </div>
      </div>

      {paymentStatus === "PARTIAL" && (
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Uang Muka
          </Label>
          <Input
            type="number"
            min="1"
            step="1"
            className={cn("h-9 tabular-nums", glassInput)}
            {...register("initialPaidAmount", { valueAsNumber: true })}
          />
          {errors.initialPaidAmount && (
            <p className="text-xs text-red-500">
              {typeof errors.initialPaidAmount.message === "string"
                ? errors.initialPaidAmount.message
                : ""}
            </p>
          )}
        </div>
      )}

      {paymentStatus !== "PAID" && (
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Jatuh Tempo
          </Label>
          <Input
            type="date"
            className={cn("h-9", glassInput)}
            {...register("dueDate")}
          />
          {errors.dueDate && (
            <p className="text-xs text-red-500">
              {typeof errors.dueDate.message === "string"
                ? errors.dueDate.message
                : ""}
            </p>
          )}
        </div>
      )}

      <Separator className="bg-white/50" />

      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Catatan (opsional)
        </Label>
        <Textarea
          placeholder="Kualitas, kondisi saat tiba, dll."
          rows={2}
          className={cn("resize-none text-sm", glassInput)}
          {...register("notes")}
        />
      </div>
    </>
  );
}
