import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description, className, ...props }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 mb-5", className)} {...props}>
      <h2 className="text-lg font-bold tracking-tight text-stone-900">{title}</h2>
      {description && <p className="text-sm text-stone-500 font-medium">{description}</p>}
    </div>
  );
}
