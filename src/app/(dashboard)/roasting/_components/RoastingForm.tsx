"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";

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
import { formatKg } from "@/lib/format";
import {
  createRoastingBatch,
  type GBStockOption,
  type RBProductOption,
} from "../actions";

// =============================================================================
// Zod schema
// =============================================================================

const ROAST_LEVELS = ["LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"] as const;
const ROAST_LEVEL_LABELS: Record<string, string> = {
  LIGHT:       "Light",
  MEDIUM:      "Medium",
  MEDIUM_DARK: "Medium Dark",
  DARK:        "Dark",
};

const schema = z
  .object({
    inputProductId: z.string().min(1, "Wajib pilih Green Bean"),
    inputWeightKg: z.number().positive("Harus lebih dari 0"),
    outputMode: z.enum(["existing", "new"]),
    outputProductId: z.string().optional(),
    outputProductName: z.string().optional(),
    outputProductOrigin: z.string().optional(),
    outputRoastLevel: z.string().optional(),
    outputWeightKg: z.number().positive("Harus lebih dari 0"),
    roastDurationMin: z.number().int().positive().optional().or(z.literal(0)),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.outputMode === "existing" && !data.outputProductId) {
      ctx.addIssue({ code: "custom", path: ["outputProductId"], message: "Wajib pilih produk" });
    }
    if (data.outputMode === "new") {
      if (!data.outputProductName || data.outputProductName.trim().length < 2) {
        ctx.addIssue({ code: "custom", path: ["outputProductName"], message: "Nama minimal 2 karakter" });
      }
    }
    if (data.outputWeightKg >= data.inputWeightKg) {
      ctx.addIssue({
        code: "custom",
        path: ["outputWeightKg"],
        message: "Berat keluar harus lebih kecil dari berat masuk",
      });
    }
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

// ─────────────────────────────────────────────
// Shrinkage display
// ─────────────────────────────────────────────

function ShrinkageDisplay({ input, output }: { input: number; output: number }) {
  const valid = input > 0 && output > 0 && output < input;
  if (!valid) {
    return (
      <div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50">
        <p className="text-xs text-zinc-400">Isi berat masuk & keluar untuk melihat kalkulasi</p>
      </div>
    );
  }

  const lossKg = input - output;
  const lossPercent = (lossKg / input) * 100;
  const badgeColor =
    lossPercent > 25
      ? "bg-red-50 border-red-200 text-red-700"
      : lossPercent > 18
        ? "bg-amber-50 border-amber-200 text-amber-700"
        : "bg-emerald-50 border-emerald-200 text-emerald-700";

  return (
    <div className={`flex items-center justify-between rounded-lg border px-4 py-3 ${badgeColor}`}>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70">Shrinkage</p>
        <p className="text-2xl font-bold tabular-nums">{lossPercent.toFixed(2)}%</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70">Susut</p>
        <p className="text-base font-semibold tabular-nums">{formatKg(lossKg)}</p>
      </div>
    </div>
  );
}

// =============================================================================
// Props
// =============================================================================

interface RoastingFormProps {
  id: string;
  gbOptions: GBStockOption[];
  rbOptions: RBProductOption[];
  onSuccess: () => void;
  onPendingChange: (pending: boolean) => void;
}

// =============================================================================
// Component
// =============================================================================

export function RoastingForm({
  id,
  gbOptions,
  rbOptions,
  onSuccess,
  onPendingChange,
}: RoastingFormProps) {
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
      inputProductId: "",
      inputWeightKg: 0,
      outputMode: rbOptions.length > 0 ? "existing" : "new",
      outputProductId: "",
      outputProductName: "",
      outputProductOrigin: "",
      outputRoastLevel: "",
      outputWeightKg: 0,
      roastDurationMin: 0,
      notes: "",
    },
  });

  const [inputProductId, inputWeightKg, outputWeightKg, outputMode] = watch([
    "inputProductId",
    "inputWeightKg",
    "outputWeightKg",
    "outputMode",
  ]);

  // Stok GB yang dipilih (untuk hint)
  const selectedGB = gbOptions.find((g) => g.id === inputProductId);

  // ── Submit ──
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    onPendingChange(true);
    try {
      const result = await createRoastingBatch({
        inputProductId: values.inputProductId,
        inputWeightKg: values.inputWeightKg,
        outputMode: values.outputMode,
        outputProductId: values.outputMode === "existing" ? values.outputProductId : undefined,
        outputProductName: values.outputMode === "new" ? values.outputProductName : undefined,
        outputProductOrigin: values.outputMode === "new" ? values.outputProductOrigin : undefined,
        outputRoastLevel: values.outputRoastLevel || undefined,
        outputWeightKg: values.outputWeightKg,
        roastDurationMin:
          values.roastDurationMin && values.roastDurationMin > 0
            ? values.roastDurationMin
            : undefined,
        notes: values.notes,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`Batch roasting dicatat — ${result.batchCode}`);
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
      {/* ── Pilih Green Bean ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">
          Green Bean <span className="text-red-500">*</span>
        </Label>
        <Controller
          control={control}
          name="inputProductId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(val: string | null) => field.onChange(val ?? "")}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Pilih Green Bean..." />
              </SelectTrigger>
              <SelectContent>
                {gbOptions.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    Tidak ada GB dengan stok tersedia
                  </SelectItem>
                ) : (
                  gbOptions.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                      {g.origin ? ` — ${g.origin}` : ""}
                      {" "}
                      <span className="text-zinc-400">({formatKg(g.stockKg)})</span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
        {selectedGB && (
          <p className="text-xs text-zinc-400">
            Stok tersedia: <span className="font-semibold text-zinc-700">{formatKg(selectedGB.stockKg)}</span>
          </p>
        )}
        <FieldError message={errors.inputProductId?.message} />
      </FieldGroup>

      {/* ── Berat Masuk ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">
          Berat Masuk / Green Bean (kg) <span className="text-red-500">*</span>
        </Label>
        <Input
          type="number"
          step="0.001"
          min="0"
          placeholder="0.000"
          className="h-9 tabular-nums"
          {...register("inputWeightKg", { valueAsNumber: true })}
        />
        {selectedGB && Number(inputWeightKg) > selectedGB.stockKg && (
          <p className="text-xs text-red-500">
            Melebihi stok tersedia ({formatKg(selectedGB.stockKg)})
          </p>
        )}
        <FieldError message={errors.inputWeightKg?.message} />
      </FieldGroup>

      <Separator className="bg-zinc-100" />

      {/* ── Output RB mode toggle ── */}
      <div>
        <Label className="text-xs font-medium text-zinc-700 mb-2 block">
          Roasted Bean Output <span className="text-red-500">*</span>
        </Label>
        <Controller
          control={control}
          name="outputMode"
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

      {/* ── Select existing RB ── */}
      {outputMode === "existing" && (
        <FieldGroup>
          <Label className="text-xs font-medium text-zinc-700">Pilih Roasted Bean</Label>
          <Controller
            control={control}
            name="outputProductId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val: string | null) => field.onChange(val ?? "")}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Pilih produk RB..." />
                </SelectTrigger>
                <SelectContent>
                  {rbOptions.length === 0 ? (
                    <SelectItem value="_empty" disabled>Belum ada produk RB</SelectItem>
                  ) : (
                    rbOptions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                        {r.roastLevel ? ` — ${ROAST_LEVEL_LABELS[r.roastLevel] ?? r.roastLevel}` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.outputProductId?.message} />
        </FieldGroup>
      )}

      {/* ── New RB product ── */}
      {outputMode === "new" && (
        <div className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
          <FieldGroup>
            <Label className="text-xs font-medium text-zinc-700">
              Nama Roasted Bean <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Gayo Natural Medium"
              className="h-9 bg-white"
              {...register("outputProductName")}
            />
            <FieldError message={errors.outputProductName?.message} />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup>
              <Label className="text-xs font-medium text-zinc-700">Origin</Label>
              <Input
                placeholder="e.g. Aceh Gayo"
                className="h-9 bg-white"
                {...register("outputProductOrigin")}
              />
            </FieldGroup>

            <FieldGroup>
              <Label className="text-xs font-medium text-zinc-700">Roast Level</Label>
              <Controller
                control={control}
                name="outputRoastLevel"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val: string | null) => field.onChange(val ?? "")}
                  >
                    <SelectTrigger className="w-full h-9 bg-white">
                      <SelectValue placeholder="Pilih level..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ROAST_LEVELS.map((rl) => (
                        <SelectItem key={rl} value={rl}>
                          {ROAST_LEVEL_LABELS[rl]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldGroup>
          </div>
        </div>
      )}

      <Separator className="bg-zinc-100" />

      {/* ── Berat Keluar ── */}
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label className="text-xs font-medium text-zinc-700">
            Berat Keluar / Matang (kg) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            step="0.001"
            min="0"
            placeholder="0.000"
            className="h-9 tabular-nums"
            {...register("outputWeightKg", { valueAsNumber: true })}
          />
          <FieldError message={errors.outputWeightKg?.message} />
        </FieldGroup>

        <FieldGroup>
          <Label className="text-xs font-medium text-zinc-700">Durasi (menit)</Label>
          <Input
            type="number"
            step="1"
            min="0"
            placeholder="0"
            className="h-9 tabular-nums"
            {...register("roastDurationMin", { valueAsNumber: true })}
          />
        </FieldGroup>
      </div>

      {/* ── Shrinkage kalkulasi realtime ── */}
      <ShrinkageDisplay
        input={Number(inputWeightKg) || 0}
        output={Number(outputWeightKg) || 0}
      />

      {/* ── Catatan ── */}
      <FieldGroup>
        <Label className="text-xs font-medium text-zinc-700">Catatan (opsional)</Label>
        <Textarea
          placeholder="Kondisi roasting, profil, dll."
          rows={2}
          className="resize-none text-sm"
          {...register("notes")}
        />
      </FieldGroup>

      <button type="submit" className="hidden" aria-hidden disabled={isSubmitting} />
    </form>
  );
}
