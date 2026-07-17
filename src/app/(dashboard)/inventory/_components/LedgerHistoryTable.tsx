"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LedgerHistoryRow } from "../actions";

const PAGE_SIZE = 25;

export function LedgerHistoryTable({
  entries,
  onFilteredEntriesChange,
}: {
  entries: LedgerHistoryRow[];
  onFilteredEntriesChange: (entries: LedgerHistoryRow[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState<"ALL" | "IN" | "OUT">("ALL");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesDirection = direction === "ALL" || entry.entryType === direction;
      const matchesQuery =
        !normalizedQuery ||
        [
          entry.itemCode,
          entry.itemName,
          entry.refType,
          entry.refId,
          entry.notes ?? "",
          entry.createdByName,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesDirection && matchesQuery;
    });
  }, [direction, entries, query]);

  useEffect(() => {
    setPage(1);
    onFilteredEntriesChange(filtered);
  }, [filtered, onFilteredEntriesChange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleEntries = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari item, referensi, catatan, atau operator"
            className="h-9 bg-white/60 pl-9"
          />
        </div>
        <div className="inline-flex rounded-lg border border-white/60 bg-white/40 p-1">
          {(["ALL", "IN", "OUT"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={direction === value ? "default" : "ghost"}
              className="h-7 min-w-14 rounded-md text-xs"
              onClick={() => setDirection(value)}
            >
              {value === "ALL" ? "Semua" : value}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/60 bg-white/40 shadow-sm backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Referensi</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead className="text-right">Mutasi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-sm text-slate-500">
                  Tidak ada mutasi yang sesuai filter.
                </TableCell>
              </TableRow>
            ) : (
              visibleEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap text-xs text-slate-500">
                    {new Date(entry.createdAt).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-800">{entry.itemName}</div>
                    <div className="text-xs text-slate-500">{entry.itemCode}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-slate-700">{entry.refType}</div>
                    <div className="max-w-48 truncate text-xs text-slate-400" title={entry.notes ?? entry.refId}>
                      {entry.notes ?? entry.refId}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{entry.createdByName}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        entry.entryType === "IN"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }
                    >
                      {entry.entryType === "IN" ? "+" : "-"}
                      {entry.quantity.toLocaleString("id-ID")} {entry.unit}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{filtered.length} mutasi, maksimal 500 terbaru</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Halaman sebelumnya"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft size={14} />
          </Button>
          <span>Halaman {page} dari {totalPages}</span>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Halaman berikutnya"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
