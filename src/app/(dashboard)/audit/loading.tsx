export default function AuditLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 shrink-0 border-b border-[var(--glass-border)] bg-[var(--glass-bg-hover)] backdrop-blur-[var(--glass-blur)]">
        <div className="mx-auto flex min-h-[64px] w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-8">
          <div className="space-y-1">
            <div className="h-5 w-36 animate-pulse rounded-md bg-[var(--glass-bg)]" />
            <div className="h-3 w-48 animate-pulse rounded-md bg-[var(--glass-bg)]" />
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-4">
          <div className="flex gap-6 border-b border-[var(--glass-border)] pb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 w-28 animate-pulse rounded bg-[var(--glass-bg)]" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-[1.25rem] bg-[var(--glass-bg)]" />
        </div>
      </div>
    </div>
  );
}
