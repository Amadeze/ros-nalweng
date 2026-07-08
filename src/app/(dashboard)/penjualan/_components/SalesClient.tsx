"use client";

import { useState } from "react";
import { ReceiptText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { StandardDrawer } from "@/components/StandardDrawer";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceForm } from "./InvoiceForm";
import { CustomerForm } from "../../master-data/_components/CustomerForm";
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
  
  // For Create Customer modal
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);

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
            className="gap-1.5 bg-blue-500 text-white hover:bg-blue-600 shadow-md rounded-xl font-bold"
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
        onOpenChange={(v) => { if (!isSubmitting) setCustomerDrawerOpen(v); }}
        title="Tambah Pelanggan Baru"
        size="md"
        submitButton={
          <Button type="submit" form="new-customer-form" size="sm" className="gap-1.5 bg-blue-500 text-white hover:bg-blue-600 shadow-md rounded-xl font-bold">
            Simpan Pelanggan
          </Button>
        }
      >
        <CustomerForm
          id="new-customer-form"
          onSuccess={() => {
            setCustomerDrawerOpen(false);
            // Revalidation via server action will refresh the customers list
          }}
        />
      </StandardDrawer>
    </>
  );
}
