"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
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
import { formatKg } from "@/lib/format";
import {
  createParentRoastingBatch,
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
    mode: z.enum(["ARTISAN", "MANUAL"]),
    inputProductId: z.string().min(1, "Wajib pilih Green Bean"),
    targetWeightKg: z.number().positive("Harus lebih dari 0"),
    outputMode: z.enum(["existing", "new"]),
    outputProductId: z.string().optional(),
    outputProductName: z.string().optional(),
    outputProductOrigin: z.string().optional(),
    outputRoastLevel: z.string().optional(),
    actualOutputKg: z.number().optional(),
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
    if (data.mode === "MANUAL") {
      if (!data.actualOutputKg || data.actualOutputKg <= 0) {
        ctx.addIssue({ code: "custom", path: ["actualOutputKg"], message: "Wajib diisi untuk mode manual" });
      } else if (data.actualOutputKg >= data.targetWeightKg) {
        ctx.addIssue({
          code: "custom",
          path: ["actualOutputKg"],
          message: "Berat keluar harus lebih kecil dari berat masuk",
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

const glassInput = "bg-white/40 border-white/60 backdrop-blur-md transition-all focus:bg-white/60 focus:border-white/80";
const glassCard = "rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl p-4 shadow-sm";

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
      <div className={cn(glassCard, "flex h-16 items-center justify-center border-dashed border-white/80")}>
        <p className="text-xs text-slate-500 font-medium tracking-wide">Isi berat masuk & keluar untuk melihat kalkulasi</p>
      </div>
    );
  }

  const lossKg = input - output;
  const lossPercent = (lossKg / input) * 100;
  const badgeColor =
    lossPercent > 25
      ? "bg-red-50/90 border-red-200 text-red-700 shadow-sm"
      : lossPercent > 18
        ? "bg-amber-50/90 border-amber-200 text-amber-700 shadow-sm"
        : "bg-emerald-50/90 border-emerald-200 text-emerald-700 shadow-sm";

  return (
    <div className={`flex items-center justify-between rounded-[1.25rem] border backdrop-blur-md px-5 py-4 ${badgeColor}`}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Shrinkage</p>
        <p className="text-3xl font-black tabular-nums tracking-tight">{lossPercent.toFixed(2)}%</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Susut</p>
        <p className="text-lg font-bold tabular-nums">{formatKg(lossKg)}</p>
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
      mode: "ARTISAN",
      inputProductId: "",
      targetWeightKg: 0,
      outputMode: rbOptions.length > 0 ? "existing" : "new",
      outputProductId: "",
      outputProductName: "",
      outputProductOrigin: "",
      outputRoastLevel: "",
      actualOutputKg: 0,
      notes: "",
    },
  });

  const [mode, inputProductId, targetWeightKg, actualOutputKg, outputMode] = watch([
    "mode",
    "inputProductId",
    "targetWeightKg",
    "actualOutputKg",
    "outputMode",
  ]);

  const selectedGB = gbOptions.find((g) => g.id === inputProductId);

  const filteredRbOptions = rbOptions.filter((rb) => {
    if (!selectedGB || !selectedGB.origin) return true;
    if (rb.origin) return rb.origin === selectedGB.origin;
    
    const gbName = selectedGB.name.toLowerCase();
    const rbName = rb.name.toLowerCase();
    const gbWords = gbName.split(" ").filter(w => w.length > 3 && !['green', 'bean'].includes(w));
    
    return gbWords.some(w => rbName.includes(w));
  });

  useEffect(() => {
    const currentRbId = watch("outputProductId");
    if (currentRbId && !filteredRbOptions.some(r => r.id === currentRbId)) {
      reset((prev) => ({ ...prev, outputProductId: "" }));
    }
  }, [inputProductId, filteredRbOptions, watch, reset]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    onPendingChange(true);
    try {
      const result = await createParentRoastingBatch({
        mode: values.mode,
        inputProductId: values.inputProductId,
        targetWeightKg: values.targetWeightKg,
        outputMode: values.outputMode,
        outputProductId: values.outputMode === "existing" ? values.outputProductId : undefined,
        outputProductName: values.outputMode === "new" ? values.outputProductName : undefined,
        outputProductOrigin: values.outputMode === "new" ? values.outputProductOrigin : undefined,
        outputRoastLevel: values.outputRoastLevel || undefined,
        actualOutputKg: values.actualOutputKg,
        notes: values.notes,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        values.mode === "ARTISAN"
          ? `Sesi roasting dimulai — ${result.batchCode}`
          : `Batch roasting dicatat — ${result.batchCode}`
      );
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

      {/* ── Mode Toggle ── */}
      <div>
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2 block">
          Pilih Metode Pencatatan
        </Label>
        <Controller
          control={control}
          name="mode"
          render={({ field }) => (
            <div className="flex gap-2 bg-white/30 p-1 rounded-xl shadow-sm border border-white/60 backdrop-blur-md">
              {(["ARTISAN", "MANUAL"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => field.onChange(m)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-bold transition-all",
                    field.value === m
                      ? m === "ARTISAN" ? "bg-indigo-500 text-white shadow-md" : "bg-emerald-500 text-white shadow-md"
                      : "text-slate-500 hover:bg-white/50"
                  )}
                >
                  {m === "ARTISAN" ? "Mulai Sesi (Zero-Touch)" : "Catat Manual Cepat"}
                </button>
              ))}
            </div>
          )}
        />
        <p className="text-[10.5px] mt-2 font-medium text-slate-500 leading-tight">
          {mode === "ARTISAN"
            ? "Pilih ini di pagi hari. Target stok akan di-lock, dan Anda tinggal menunggu Webhook Artisan masuk."
            : "Pilih ini untuk mencatat hasil akhir secara instan tanpa perlu koneksi ke aplikasi Artisan."}
        </p>
      </div>

      <Separator className="bg-white/50" />

      {/* ── Pilih Green Bean ── */}
      <FieldGroup>
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
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
              <SelectTrigger className={cn("w-full h-9", glassInput)}>
                <SelectValue placeholder="Pilih Green Bean...">
                  {field.value ? gbOptions.find((g) => g.id === field.value)?.name : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {gbOptions.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    Tidak ada GB dengan stok tersedia
                  </SelectItem>
                ) : (
                  gbOptions.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}{g.origin ? ` — ${g.origin}` : ""}
                      {" "}
                      <span className="text-slate-400 font-normal">({formatKg(g.stockKg)})</span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
        {selectedGB && (
          <p className="text-[10px] font-medium text-slate-500 pt-1">
            Stok tersedia: <span className="font-bold text-slate-800">{formatKg(selectedGB.stockKg)}</span>
          </p>
        )}
        <FieldError message={errors.inputProductId?.message} />
      </FieldGroup>

      {/* ── Berat Masuk ── */}
      <FieldGroup>
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Berat Masuk / Green Bean (kg) <span className="text-red-500">*</span>
        </Label>
        <Input
          type="number"
          step="0.001"
          min="0"
          placeholder="0.000"
          className={cn("h-9 tabular-nums font-semibold", glassInput)}
          {...register("targetWeightKg", { valueAsNumber: true })}
        />
        {selectedGB && Number(targetWeightKg) > selectedGB.stockKg && (
          <p className="text-[10px] font-medium text-red-500">
            Melebihi stok tersedia ({formatKg(selectedGB.stockKg)})
          </p>
        )}
        <FieldError message={errors.targetWeightKg?.message} />
      </FieldGroup>

      <Separator className="bg-white/50" />

      {/* ── Output RB mode toggle ── */}
      <div>
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2 block">
          Target Roasted Bean <span className="text-red-500">*</span>
        </Label>
        <Controller
          control={control}
          name="outputMode"
          render={({ field }) => (
            <div className="flex gap-2">
              {(["existing", "new"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => field.onChange(m)}
                  className={cn(
                    "flex-1 rounded-xl border py-2 text-xs font-bold transition-all shadow-sm",
                    field.value === m
                      ? "border-blue-500 bg-blue-500 text-white shadow-md ring-2 ring-blue-500/20 ring-offset-1"
                      : "border-white/60 bg-white/40 text-slate-500 hover:bg-white/60"
                  )}
                >
                  {m === "existing" ? "Produk Existing" : "+ Produk Baru"}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {/* ── Select existing RB ── */}
      {outputMode === "existing" && (
        <FieldGroup>
          <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Pilih Roasted Bean</Label>
          <Controller
            control={control}
            name="outputProductId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val: string | null) => field.onChange(val ?? "")}
              >
                <SelectTrigger className={cn("w-full h-9", glassInput)}>
                  <SelectValue placeholder="Pilih produk RB...">
                    {field.value ? filteredRbOptions.find((r) => r.id === field.value)?.name : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {filteredRbOptions.length === 0 ? (
                    <SelectItem value="_empty" disabled>Tidak ada RB dengan origin yang sesuai</SelectItem>
                  ) : (
                    filteredRbOptions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}{r.roastLevel ? ` — ${ROAST_LEVEL_LABELS[r.roastLevel] ?? r.roastLevel}` : ""}
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
        <div className={cn(glassCard, "space-y-4")}>
          <FieldGroup>
            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Nama Roasted Bean <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Gayo Natural Medium"
              className={cn("h-9 font-medium", glassInput)}
              {...register("outputProductName")}
            />
            <FieldError message={errors.outputProductName?.message} />
          </FieldGroup>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Origin</Label>
              <Input
                placeholder="e.g. Aceh Gayo"
                className={cn("h-9", glassInput)}
                {...register("outputProductOrigin")}
              />
            </FieldGroup>

            <FieldGroup>
              <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Roast Level</Label>
              <Controller
                control={control}
                name="outputRoastLevel"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val: string | null) => field.onChange(val ?? "")}
                  >
                    <SelectTrigger className={cn("w-full h-9", glassInput)}>
                      <SelectValue placeholder="Pilih level...">
                        {field.value ? ROAST_LEVEL_LABELS[field.value as keyof typeof ROAST_LEVEL_LABELS] : null}
                      </SelectValue>
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

      {/* ── MANUAL MODE ONLY: Berat Keluar ── */}
      {mode === "MANUAL" && (
        <>
          <Separator className="bg-white/50" />
          <FieldGroup>
            <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Berat Keluar / Matang (kg) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              step="0.001"
              min="0"
              placeholder="0.000"
              className={cn("h-9 tabular-nums font-semibold", glassInput)}
              {...register("actualOutputKg", { valueAsNumber: true })}
            />
            <FieldError message={errors.actualOutputKg?.message} />
          </FieldGroup>

          {/* ── Shrinkage kalkulasi realtime ── */}
          <ShrinkageDisplay
            input={Number(targetWeightKg) || 0}
            output={Number(actualOutputKg) || 0}
          />
        </>
      )}

      {/* ── Catatan ── */}
      <FieldGroup>
        <Label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Catatan (opsional)</Label>
        <Textarea
          placeholder="Kondisi roasting, profil, dll."
          rows={3}
          className={cn("resize-none text-sm", glassInput)}
          {...register("notes")}
        />
      </FieldGroup>

      <button type="submit" className="hidden" aria-hidden disabled={isSubmitting} />
    </form>
  );
}
