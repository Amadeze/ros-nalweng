import { ExtendedTenant } from "./ThemeProps";

interface TenantBrandProps {
  tenant: ExtendedTenant;
  fallback: string;
  logoClassName?: string;
}

export function TenantBrand({
  tenant,
  fallback,
  logoClassName = "h-8 w-8",
}: TenantBrandProps) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {tenant.logoUrl && (
        <img
          src={tenant.logoUrl}
          alt=""
          aria-hidden="true"
          className={`${logoClassName} shrink-0 object-contain`}
        />
      )}
      <span className="truncate">{tenant.name || fallback}</span>
    </span>
  );
}
