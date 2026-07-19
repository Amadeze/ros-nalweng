"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReceiptText, Loader2, DollarSign, FileText, CheckCircle2, Clock, Download, FileText as FileTextIcon, FileSpreadsheet, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { StandardDrawer } from "@/components/StandardDrawer";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceForm } from "./InvoiceForm";
import { CustomerForm } from "../../master-data/_components/CustomerForm";
import { SampleForm } from "./SampleForm";
import { SampleUsagePanel } from "./SampleUsagePanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { CustomerOption, FGStockOption, InvoiceRow } from "../actions";
import type { SamplePageData } from "../sample-actions";

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
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-50"
        aria-label="Export"
      >
        <Download size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
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
  sampleData: SamplePageData;
}

export function SalesClient({ invoices, customers, fgOptions, sampleData }: SalesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sampleDrawerOpen, setSampleDrawerOpen] = useState(false);
  const [sampleSubmitting, setSampleSubmitting] = useState(false);
  const [workspace, setWorkspace] = useState<"sales" | "samples">("sales");
  const sampleDeepLinkHandled = useRef(false);
  const [customerOptions, setCustomerOptions] = useState(customers);
  const [preferredCustomerId, setPreferredCustomerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomerSubmitting, setIsCustomerSubmitting] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null);

  // For Create Customer modal
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);

  useEffect(() => {
    setCustomerOptions(customers);
  }, [customers]);

  useEffect(() => {
    if (searchParams.get("action") === "sample" && !sampleDeepLinkHandled.current) {
      sampleDeepLinkHandled.current = true;
      setWorkspace("samples");
      setSampleDrawerOpen(true);
    }
  }, [searchParams]);

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
              className="gap-2 rounded-lg px-4 font-semibold"
              onClick={() => { setWorkspace("samples"); setSampleDrawerOpen(true); }}
            >
              <Gift size={16} />
              Kasih Sample
            </Button>
            <Button
              size="default"
              variant="outline"
              className="gap-2 rounded-lg px-4 font-semibold"
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
              className="gap-2 rounded-lg px-4 font-semibold"
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
              className="gap-2 rounded-lg bg-stone-900 px-5 font-semibold text-white shadow-none hover:bg-stone-800"
              onClick={() => setDrawerOpen(true)}
            >
              <ReceiptText
                size={16}
                className=""
              />
              Nota Baru
            </Button>
          </div>
        }
        mobileSpeedDialItems={[
          { label: "Kasih Sample", icon: <Gift size={18} />, onClick: () => { setWorkspace("samples"); setSampleDrawerOpen(true); }, variant: "secondary" },
          { label: "Nota Baru", icon: <ReceiptText size={18} />, onClick: () => setDrawerOpen(true), variant: "primary" },
        ]}
        mobileHeaderActions={<ExportMenu invoices={invoices} />}
      >
        <div className="mb-5 flex gap-1 border-b border-stone-200" role="tablist" aria-label="Area penjualan">
          <button type="button" role="tab" aria-selected={workspace === "sales"} onClick={() => setWorkspace("sales")} className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${workspace === "sales" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-800"}`}>Penjualan</button>
          <button type="button" role="tab" aria-selected={workspace === "samples"} onClick={() => setWorkspace("samples")} className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${workspace === "samples" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-800"}`}>Sample <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">{sampleData.todaySummary.packCount}</span></button>
        </div>

        {workspace === "sales" ? <>
        <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-stone-200 bg-white xl:grid-cols-4">
          {[
            { label: "Total penjualan", value: formatRupiah(kpi.totalRevenue), icon: DollarSign, tone: "text-emerald-700 bg-emerald-50" },
            { label: "Nota lunas", value: `${kpi.paidCount} faktur`, icon: CheckCircle2, tone: "text-sky-700 bg-sky-50" },
            { label: "Belum lunas", value: `${kpi.unpaidCount} faktur`, icon: Clock, tone: "text-amber-700 bg-amber-50" },
            { label: "Total diterbitkan", value: `${kpi.totalInvoices} faktur`, icon: FileText, tone: "text-stone-600 bg-stone-100" },
          ].map((metric, index) => (
            <div
              key={metric.label}
              className={`min-w-0 p-4 sm:p-5 ${index % 2 === 0 ? "border-r border-stone-200" : ""} ${index < 2 ? "border-b border-stone-200 xl:border-b-0" : ""} ${index === 1 ? "xl:border-r" : ""} ${index === 2 ? "xl:border-r" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium leading-4 text-stone-500">{metric.label}</p>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${metric.tone}`}>
                  <metric.icon size={17} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-2 whitespace-nowrap font-mono text-sm font-bold tabular-nums text-stone-900 sm:text-lg lg:text-xl">{metric.value}</p>
            </div>
          ))}
        </div>

        <InvoiceTable invoices={invoices} />
        </> : <SampleUsagePanel data={sampleData} />}
      </StandardPageLayout>

      <StandardDrawer
        open={sampleDrawerOpen}
        onOpenChange={(open) => { if (!sampleSubmitting) setSampleDrawerOpen(open); }}
        title="Kasih Sample"
        description="Catat sekali; stok, HPP promosi, dan closing langsung ikut diperbarui."
        size="lg"
        submitButton={
          <Button type="submit" form="sample-form" size="sm" disabled={sampleSubmitting} className="gap-1.5 rounded-xl bg-stone-900 font-bold text-white hover:bg-stone-800 disabled:opacity-60">
            {sampleSubmitting && <Loader2 size={13} className="animate-spin" />}
            {sampleSubmitting ? "Mencatat..." : "Catat & Kurangi Stok"}
          </Button>
        }
      >
        <SampleForm id="sample-form" data={sampleData} onPendingChange={setSampleSubmitting} onSuccess={() => { setSampleDrawerOpen(false); setWorkspace("samples"); router.refresh(); }} />
      </StandardDrawer>

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
            className="gap-1.5 bg-amber-700 text-white hover:bg-amber-800 shadow-md rounded-xl font-bold disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
            {isSubmitting ? "Menyimpan..." : "Terbitkan Nota"}
          </Button>
        }
      >
        <InvoiceForm
          id="invoice-form"
          customers={customerOptions}
          fgOptions={fgOptions}
          onSuccess={(invoiceId) => {
            setLastInvoiceId(invoiceId);
            setDrawerOpen(false);
            router.refresh();
          }}
          onPendingChange={setIsSubmitting}
          onAddCustomer={() => setCustomerDrawerOpen(true)}
          preferredCustomerId={preferredCustomerId}
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
            className="gap-1.5 bg-amber-700 text-white hover:bg-amber-800 shadow-md rounded-xl font-bold disabled:opacity-60"
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
          onSuccess={(customer) => {
            if (customer) {
              setCustomerOptions((current) => [
                customer,
                ...current.filter((item) => item.id !== customer.id),
              ]);
              setPreferredCustomerId(customer.id);
            }
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
              className="bg-amber-700 text-white"
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
