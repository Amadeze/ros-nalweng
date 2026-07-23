import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  mobileActions?: React.ReactNode;
}

export function PageHeader({ title, description, actions, mobileActions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-6 px-4 sm:px-6 lg:px-8 border-b border-stone-200 bg-white sticky top-0 z-10">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-stone-500 mt-1 font-medium">{description}</p>}
      </div>
      {(actions || mobileActions) && (
        <div className="flex flex-wrap items-center gap-3">
          {actions && <div className="hidden sm:flex items-center gap-3">{actions}</div>}
          {mobileActions && <div className="flex sm:hidden items-center gap-3">{mobileActions}</div>}
          {actions && !mobileActions && <div className="flex sm:hidden items-center gap-3">{actions}</div>}
        </div>
      )}
    </div>
  );
}
