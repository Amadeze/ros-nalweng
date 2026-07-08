"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCustomer, updateCustomer } from "../actions";
import type { CustomerRow } from "../actions";

const schema = z.object({
  name:     z.string().min(1, "Nama wajib diisi"),
  phone:    z.string().optional(),
  email:    z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address:  z.string().optional(),
  tier:     z.enum(["RETAIL", "WHOLESALE_SILVER", "WHOLESALE_GOLD"]),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface CustomerFormProps {
  id: string;
  onSuccess: () => void;
  initialData?: CustomerRow;
}

export function CustomerForm({ id, onSuccess, initialData }: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? { name: initialData.name, phone: initialData.phone ?? "", email: initialData.email ?? "", address: initialData.address ?? "", tier: initialData.tier, isActive: initialData.isActive }
      : { name: "", phone: "", email: "", address: "", tier: "RETAIL", isActive: true },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = isEditMode
        ? await updateCustomer({ id: initialData!.id, ...values, email: values.email || undefined })
        : await createCustomer({ ...values, email: values.email || undefined });
      if (!result.success) { toast.error(result.error); return; }
      toast.success(isEditMode ? `${result.code} berhasil diperbarui` : `Pelanggan ${result.code} berhasil ditambahkan`);
      onSuccess();
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">
          Nama Pelanggan <span className="text-red-500">*</span>
        </Label>
        <Input placeholder="Kafe ABC" className="h-9" {...register("name")} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">No. Telp / WhatsApp</Label>
        <Input placeholder="08xxxxxxxxxx" className="h-9" {...register("phone")} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Email</Label>
        <Input type="email" placeholder="kafe@email.com" className="h-9" {...register("email")} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Alamat</Label>
        <Input placeholder="Jl. Sudirman No.1" className="h-9" {...register("address")} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Level Harga (Tier)</Label>
        <Controller
          control={control}
          name="tier"
          render={({ field }) => (
            <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Pilih level...">
                  {field.value === "RETAIL" ? "Eceran (Retail)" : field.value === "WHOLESALE_SILVER" ? "Grosir Silver" : field.value === "WHOLESALE_GOLD" ? "Grosir Gold" : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RETAIL">Eceran (Retail)</SelectItem>
                <SelectItem value="WHOLESALE_SILVER">Grosir Silver</SelectItem>
                <SelectItem value="WHOLESALE_GOLD">Grosir Gold</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {isEditMode && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-zinc-700">Status</Label>
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <div className="flex gap-2">
                {[{ v: true, label: "Aktif", cls: "bg-emerald-50 border-emerald-300 text-emerald-700" }, { v: false, label: "Nonaktif", cls: "bg-zinc-100 border-zinc-300 text-zinc-500" }].map(({ v, label, cls }) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => field.onChange(v)}
                    className={[
                      "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                      field.value === v ? cls : "border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          />
        </div>
      )}

      <button type="submit" className="hidden" disabled={isSubmitting} />
    </form>
  );
}