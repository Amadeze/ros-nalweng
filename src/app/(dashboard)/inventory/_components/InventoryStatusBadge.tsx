import { Badge } from "@/components/ui/badge";
import type { DisplayStatus } from "@/lib/inventory-utils";

export type { DisplayStatus };

const STATUS_CONFIG: Record<DisplayStatus, { label: string; className: string }> = {
  aman: {
    label: "Aman",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rendah: {
    label: "Menipis",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  habis: {
    label: "Habis",
    className: "bg-red-50 text-red-600 border-red-200",
  },
  belum_dikonfigurasi: {
    label: "Belum Diatur",
    className: "bg-slate-50 text-slate-500 border-slate-200",
  },
};

export function InventoryStatusBadge({ status }: { status: DisplayStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`text-[11px] font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
