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
import { createSupplier, updateSupplier } from "../actions";
import type { SupplierRow } from "../actions";

const schema = z.object({
  name:     z.string().min(1, "Nama wajib diisi"),
  phone:    z.string().optional(),
  region:   z.string().optional(),
  address:  z.string().optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface SupplierFormProps {
  id: string;
  onSuccess: () => void;
  onPendingChange?: (isPending: boolean) => void;
  initialData?: SupplierRow;
}

export function SupplierForm({ id, onSuccess, onPendingChange, initialData }: SupplierFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? { name: initialData.name, phone: initialData.phone ?? "", region: initialData.region ?? "", address: initialData.address ?? "", isActive: initialData.isActive }
      : { name: "", phone: "", region: "", address: "", isActive: true },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    onPendingChange?.(true);
    try {
      const result = isEditMode
        ? await updateSupplier({ id: initialData!.id, ...values })
        : await createSupplier(values);
      if (!result.success) { toast.error(result.error); return; }
      toast.success(isEditMode ? `${result.code} berhasil diperbarui` : `Supplier ${result.code} berhasil ditambahkan`);
      onSuccess();
    } catch {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
      onPendingChange?.(false);
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">
          Nama Supplier <span className="text-red-500">*</span>
        </Label>
        <Input placeholder="PT. Kopi Nusantara" className="h-9" {...register("name")} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">No. Telp / WhatsApp</Label>
        <Input placeholder="08xxxxxxxxxx" className="h-9" {...register("phone")} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Wilayah Asal Kopi</Label>
        <Input placeholder="Gayo, Toraja, Flores, dll." className="h-9" {...register("region")} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-700">Alamat</Label>
        <Input placeholder="Jl. ..." className="h-9" {...register("address")} />
      </div>

      {/* Status — hanya tampil di edit mode */}
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