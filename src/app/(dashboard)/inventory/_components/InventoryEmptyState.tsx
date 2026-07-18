import { Package } from "lucide-react";

interface InventoryEmptyStateProps {
  label: string;
  description?: string;
  action?: React.ReactNode;
}

export function InventoryEmptyState({ label, description, action }: InventoryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mb-4">
        <Package size={24} className="text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      {description && (
        <p className="mt-1 text-xs text-slate-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
