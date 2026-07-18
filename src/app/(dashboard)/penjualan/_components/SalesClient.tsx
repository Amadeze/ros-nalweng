"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ReceiptText, Loader2, DollarSign, FileText, CheckCircle2, Clock, Download, FileText as FileTextIcon, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { StandardDrawer } from "@/components/StandardDrawer";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceForm } from "./InvoiceForm";
import { CustomerForm } from "../../master-data/_components/CustomerForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { CustomerOption, FGStockOption, InvoiceRow } from "../actions";

const triggerSilentPrint = (url: string) => {
  let iframe = document.getElementById("silent-print-iframe") as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "silent-print-iframe";
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }
  iframe.src = url;
};

// ── Export dropdown (mobile header) ──

function ExportMenu({ invoices }: { invoices: InvoiceRow[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const exportPDF = () => {
    import("jspdf").then(({ jsPDF }) => {
      import("jspdf-autotable").then(({ default: autoTable }) => {
        const doc = new jsPDF();
        doc.text("Laporan Penjualan", 14, 15);
        const tableData = invoices.map((i) => [
          i.code,
          i.customerName,
          new Date(i.issuedAt).toLocaleDateString(),
          i.status,
          formatRupiah(i.grandTotal),
        ]);
        autoTable(doc, {
          head: [["Kode Invoice", "Pelanggan", "Tanggal", "Status", "Total"]],
          body: tableData,
          startY: 20,
        });
        doc.save("Laporan_Penjualan.pdf");
      });
    });
    setOpen(false);
  };

  const exportExcel = async () => {
    const { default: writeXlsxFile } = await import("write-excel-file/browser");
    await writeXlsxFile(
      [
        ["Kode Invoice", "Pelanggan", "Tanggal", "Status", "Total"],
        ...invoices.map((invoice) => [
          invoice.code,
          invoice.customerName,
          new Date(invoice.issuedAt).toLocaleDateString("id-ID"),
          invoice.status,
          invoice.grandTotal,
        ]),
      ],
      { sheet: "Penjualan" }
    ).toFile("Laporan_Penjualan.xlsx");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/50 border border-white/60 text-slate-600 shadow-sm hover:bg-white/70 transition-colors"
        aria-label="Export"
      >
        <Download size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-xl py-1">
          <button
            onClick={exportPDF}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-white/60 transition-colors"
          >
            <FileTextIcon size={14} className="text-slate-400" />
            Export PDF
          </button>
          <button
            onClick={exportExcel}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-white/60 transition-colors"
          >
            <FileSpreadsheet size={14} className="text-slate-400" />
            Export Excel
          </button>
        </div>
      )}
    </div>
  );
}

interface SalesClientProps {
  invoices: InvoiceRow[];
  customers: CustomerOption[];
  fgOptions: FGStockOption[];
}

export function SalesClient({ invoices, customers, fgOptions }: SalesClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomerSubmitting, setIsCustomerSubmitting] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null);

  // For Create Customer modal
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);

  const kpi = useMemo(() => {
    const valid = invoices.filter((i) => i.status !== "VOID");
    const totalInvoices = valid.length;
    const paidCount = valid.filter((i) => i.status === "PAID").length;
    const unpaidCount = valid.filter(
      (i) => i.status === "ISSUED" || i.status === "PARTIAL"
    ).length;
    const totalRevenue = valid.reduce((sum, i) => sum + i.grandTotal, 0);

    return { totalInvoices, paidCount, unpaidCount, totalRevenue };
  }, [invoices]);

  return (
    <>
      <StandardPageLayout
        title="Penjualan"
        description={`${kpi.paidCount} nota lunas · ${kpi.unpaidCount} nota tempo`}
        actionButton={
          <div className="flex gap-2">
            <Button
              size="default"
              variant="outline"
              className="gap-2 rounded-xl font-semibold px-4"
              onClick={() => {
                import("jspdf").then(({ jsPDF }) => {
                  import("jspdf-autotable").then(({ default: autoTable }) => {
                    const doc = new jsPDF();
                    doc.text("Laporan Penjualan", 14, 15);
                    const tableData = invoices.map((i) => [
                      i.code,
                      i.customerName,
                      new Date(i.issuedAt).toLocaleDateString(),
                      i.status,
                      formatRupiah(i.grandTotal),
                    ]);
                    autoTable(doc, {
                      head: [
                        [
                          "Kode Invoice",
                          "Pelanggan",
                          "Tanggal",
                          "Status",
                          "Total",
                        ],
                      ],
                      body: tableData,
                      startY: 20,
                    });
                    doc.save("Laporan_Penjualan.pdf");
                  });
                });
              }}
            >
              Export PDF
            </Button>
            <Button
              size="default"
              variant="outline"
              className="gap-2 rounded-xl font-semibold px-4"
              onClick={async () => {
                const { default: writeXlsxFile } = await import(
                  "write-excel-file/browser"
                );
                await writeXlsxFile(
                  [
                    [
                      "Kode Invoice",
                      "Pelanggan",
                      "Tanggal",
                      "Status",
                      "Total",
                    ],
                    ...invoices.map((invoice) => [
                      invoice.code,
                      invoice.customerName,
                      new Date(invoice.issuedAt).toLocaleDateString("id-ID"),
                      invoice.status,
                      invoice.grandTotal,
                    ]),
                  ],
                  { sheet: "Penjualan" }
                ).toFile("Laporan_Penjualan.xlsx");
              }}
            >
              Export Excel
            </Button>
            <Button
              size="default"
              className="gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg rounded-xl font-semibold px-5 transition-all group"
              onClick={() => setDrawerOpen(true)}
            >
              <ReceiptText
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
              Nota Baru
            </Button>
          </div>
        }
        mobileFabAction={{
          label: "Nota Baru",
          icon: <ReceiptText size={22} />,
          onClick: () => setDrawerOpen(true),
          "aria-label": "Buat nota baru",
        }}
        mobileHeaderActions={<ExportMenu invoices={invoices} />}
      >
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1 rounded-2xl border border-white/60 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
              <DollarSign size={48} className="text-emerald-600" />
            </div>
            <p className="text-xs font-medium text-emerald-600 relative z-10">
              Total Volume Penjualan
            </p>
            <p className="mt-1 font-mono text-xl lg:text-2xl font-black tabular-nums text-emerald-700 relative z-10">
              {formatRupiah(kpi.totalRevenue)}
            </p>
          </div>
          <div className="col-span-2 lg:col-span-1 rounded-2xl border border-white/60 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
              <CheckCircle2 size={48} className="text-indigo-600" />
            </div>
            <p className="text-xs font-medium text-indigo-600 relative z-10">
              Nota Lunas
            </p>
            <p className="mt-1 font-mono text-xl lg:text-2xl font-black tabular-nums text-indigo-700 relative z-10">
              {kpi.paidCount}{" "}
              <span className="text-sm">faktur</span>
            </p>
          </div>
          <div className="col-span-2 lg:col-span-1 rounded-2xl border border-white/60 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
              <Clock size={48} className="text-amber-600" />
            </div>
            <p className="text-xs font-medium text-amber-600 relative z-10">
              Nota Tempo (Belum Lunas)
            </p>
            <p className="mt-1 font-mono text-xl lg:text-2xl font-black tabular-nums text-amber-700 relative z-10">
              {kpi.unpaidCount}{" "}
              <span className="text-sm">faktur</span>
            </p>
          </div>
          <div className="col-span-2 lg:col-span-1 rounded-2xl border border-white/60 bg-gradient-to-br from-slate-50 to-zinc-100 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
              <FileText size={48} className="text-slate-500" />
            </div>
            <p className="text-xs font-medium text-slate-600 relative z-10">
              Total Diterbitkan
            </p>
            <p className="mt-1 font-mono text-xl lg:text-2xl font-black tabular-nums text-slate-700 relative z-10">
              {kpi.totalInvoices}{" "}
              <span className="text-sm">faktur</span>
            </p>
          </div>
        </div>

        <InvoiceTable invoices={invoices} />
      </StandardPageLayout>

      <StandardDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) setDrawerOpen(open);
        }}
        title="Terbitkan Nota Baru"
        description="Tambah item → atur harga → pilih status Lunas atau Tempo."
        size="xl"
        submitButton={
          <Button
            type="submit"
            form="invoice-form"
            size="sm"
            disabled={isSubmitting}
            className="gap-1.5 bg-blue-500 text-white hover:bg-blue-600 shadow-md rounded-xl font-bold disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
            {isSubmitting ? "Menyimpan..." : "Terbitkan Nota"}
          </Button>
        }
      >
        <InvoiceForm
          id="invoice-form"
          customers={customers}
          fgOptions={fgOptions}
          onSuccess={(invoiceId) => {
            setLastInvoiceId(invoiceId);
            setDrawerOpen(false);
          }}
          onPendingChange={setIsSubmitting}
          onAddCustomer={() => setCustomerDrawerOpen(true)}
        />
      </StandardDrawer>

      <StandardDrawer
        open={customerDrawerOpen}
        onOpenChange={(v) => {
          if (!isCustomerSubmitting) setCustomerDrawerOpen(v);
        }}
        title="Tambah Pelanggan Baru"
        size="md"
        submitButton={
          <Button
            type="submit"
            form="new-customer-form"
            size="sm"
            disabled={isCustomerSubmitting}
            className="gap-1.5 bg-blue-500 text-white hover:bg-blue-600 shadow-md rounded-xl font-bold disabled:opacity-60"
          >
            {isCustomerSubmitting && (
              <Loader2 size={13} className="animate-spin" />
            )}
            {isCustomerSubmitting ? "Menyimpan..." : "Simpan Pelanggan"}
          </Button>
        }
      >
        <CustomerForm
          id="new-customer-form"
          onPendingChange={setIsCustomerSubmitting}
          onSuccess={() => {
            setCustomerDrawerOpen(false);
          }}
        />
      </StandardDrawer>

      <Dialog
        open={!!lastInvoiceId}
        onOpenChange={(open) => {
          if (!open) setLastInvoiceId(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nota Berhasil Terbit!</DialogTitle>
            <DialogDescription>
              Nota penjualan telah berhasil disimpan ke database. Anda dapat
              mencetak nota sekarang.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4 items-center justify-center">
            <ReceiptText
              size={48}
              className="text-emerald-500 mb-2 opacity-80"
            />
            <p className="text-sm font-medium text-slate-700 text-center">
              Apakah Anda ingin mencetak nota ini sekarang?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLastInvoiceId(null)}
            >
              Nanti Saja
            </Button>
            <Button
              className="bg-blue-600 text-white"
              onClick={() => {
                triggerSilentPrint(`/nota/${lastInvoiceId}?print=true`);
                setLastInvoiceId(null);
              }}
            >
              Cetak Nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
