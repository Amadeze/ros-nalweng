"use client";

import { useState } from "react";
import { ReceiptText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { StandardDrawer } from "@/components/StandardDrawer";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceForm } from "./InvoiceForm";
import type { CustomerOption, FGStockOption, InvoiceRow } from "../actions";

interface SalesClientProps {
  invoices: InvoiceRow[];
  customers: CustomerOption[];
  fgOptions: FGStockOption[];
}

export function SalesClient({ invoices, customers, fgOptions }: SalesClientProps) {
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null);

  const paidCount = invoices.filter((i) => i.status === "PAID").length;
  const unpaidCount = invoices.filter((i) => i.status === "ISSUED" || i.status === "PARTIAL").length;

  return (
    <>
      <StandardPageLayout
        title="Penjualan"
        description={`${paidCount} nota lunas · ${unpaidCount} nota tempo`}
        actionButton={
          <Button
            size="sm"
            className="gap-1.5 bg-zinc-900 text-white hover:bg-zinc-700"
            onClick={() => setDrawerOpen(true)}
          >
            <ReceiptText size={14} />
            Nota Baru
          </Button>
        }
      >
        <InvoiceTable invoices={invoices} />
      </StandardPageLayout>

      <StandardDrawer
        open={drawerOpen}
        onOpenChange={(open) => { if (!isSubmitting) setDrawerOpen(open); }}
        title="Terbitkan Nota Baru"
        description="Tambah item → atur harga → pilih status Lunas atau Tempo."
        size="xl"
        submitButton={
          <Button
            type="submit"
            form="invoice-form"
            size="sm"
            disabled={isSubmitting}
            className="gap-1.5 bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-60"
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
        />
      </StandardDrawer>
    </>
  );
}
