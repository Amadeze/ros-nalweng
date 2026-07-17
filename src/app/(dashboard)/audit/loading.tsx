import { PageSkeleton, StandardPageLayout } from "@/components/StandardPageLayout";

export default function AuditLoading() {
  return (
    <StandardPageLayout
      title="Audit & Integrasi"
      description="Memuat jejak aktivitas tenant."
    >
      <PageSkeleton />
    </StandardPageLayout>
  );
}
