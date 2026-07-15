"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode, ButtonHTMLAttributes } from "react";

// =============================================================================
// THEMED PRIMITIVES — Design Tokens → Components
// =============================================================================
// These primitives read CSS custom properties from ThemeEngine.
// A single <TButton> renders completely differently based on themeConfig.
// =============================================================================

// ─── Button ─────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface TButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const sizeMap: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[length:var(--t-fs-xs)]",
  md: "px-6 py-3 text-[length:var(--t-fs-sm)]",
  lg: "px-8 py-4 text-[length:var(--t-fs-base)]",
};

export function TButton({ variant = "primary", size = "md", icon, fullWidth, children, className = "", ...props }: TButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-[family-name:var(--t-font-body)] font-semibold
    rounded-[var(--t-radius)] 
    border-[length:var(--t-border-w)]
    transition-all duration-300 cursor-pointer
    active:scale-[0.97]
    disabled:opacity-50 disabled:pointer-events-none
    ${fullWidth ? "w-full" : ""}
    ${sizeMap[size]}
  `;

  const variantStyles: Record<ButtonVariant, string> = {
    primary: `
      bg-[var(--t-primary)] text-[var(--t-surface)] border-[var(--t-primary)]
      shadow-[var(--t-shadow-sm)]
      hover:shadow-[var(--t-shadow-md)] hover:brightness-110
    `,
    secondary: `
      bg-[var(--t-secondary)] text-[var(--t-surface)] border-[var(--t-secondary)]
      shadow-[var(--t-shadow-sm)]
      hover:shadow-[var(--t-shadow-md)] hover:brightness-110
    `,
    outline: `
      bg-transparent text-[var(--t-primary)] border-[var(--t-border)]
      hover:bg-[var(--t-primary)] hover:text-[var(--t-surface)]
      hover:border-[var(--t-primary)]
    `,
    ghost: `
      bg-transparent text-[var(--t-text)] border-transparent
      hover:bg-[var(--t-surface)]
    `,
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`${baseClasses} ${variantStyles[variant]} ${className}`}
      {...(props as any)}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}

// ─── Card ───────────────────────────────────────────────────────────────────

interface TCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8 md:p-10",
};

export function TCard({ children, className = "", hover = true, padding = "md" }: TCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.3 } } : undefined}
      className={`
        bg-[var(--t-surface)]
        border-[length:var(--t-border-w)] border-[var(--t-border)]
        rounded-[var(--t-radius)]
        shadow-[var(--t-shadow-md)]
        hover:shadow-[var(--t-shadow-lg)]
        transition-shadow duration-300
        overflow-hidden
        ${paddingMap[padding]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────

interface TSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function TSection({ children, className = "", id }: TSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`
        w-full max-w-[var(--t-max-w)] mx-auto
        px-5 md:px-8
        ${className}
      `}
    >
      {children}
    </motion.section>
  );
}

// ─── Heading ────────────────────────────────────────────────────────────────

interface THeadingProps {
  level?: 1 | 2 | 3 | 4 | 5;
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

const headingSizeMap: Record<number, string> = {
  1: "text-[length:var(--t-fs-5xl)]",
  2: "text-[length:var(--t-fs-4xl)]",
  3: "text-[length:var(--t-fs-3xl)]",
  4: "text-[length:var(--t-fs-2xl)]",
  5: "text-[length:var(--t-fs-xl)]",
};

export function THeading({ level = 2, children, className = "", gradient = false }: THeadingProps) {
  const Tag = `h${level}` as any;
  const gradientClasses = gradient
    ? "bg-gradient-to-br from-[var(--t-primary)] to-[var(--t-secondary)] bg-clip-text text-transparent"
    : "text-[var(--t-text)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <Tag
        className={`
          font-[family-name:var(--t-font-display)]
          font-[number:var(--t-font-weight-heading)]
          tracking-[var(--t-heading-tracking)]
          leading-[1.15]
          ${headingSizeMap[level]}
          ${gradientClasses}
          ${className}
        `}
      >
        {children}
      </Tag>
    </motion.div>
  );
}

// ─── Text ───────────────────────────────────────────────────────────────────

interface TTextProps {
  children: ReactNode;
  className?: string;
  muted?: boolean;
  size?: "xs" | "sm" | "base" | "lg";
}

const textSizeMap: Record<string, string> = {
  xs: "text-[length:var(--t-fs-xs)]",
  sm: "text-[length:var(--t-fs-sm)]",
  base: "text-[length:var(--t-fs-base)]",
  lg: "text-[length:var(--t-fs-lg)]",
};

export function TText({ children, className = "", muted = false, size = "base" }: TTextProps) {
  return (
    <p className={`
      font-[family-name:var(--t-font-body)]
      font-[number:var(--t-font-weight-body)]
      leading-[var(--t-body-line-height)]
      ${textSizeMap[size]}
      ${muted ? "text-[var(--t-text-muted)]" : "text-[var(--t-text)]"}
      ${className}
    `}>
      {children}
    </p>
  );
}

// ─── Input ──────────────────────────────────────────────────────────────────

interface TInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  multiline?: boolean;
  rows?: number;
}

export function TInput({ value, onChange, placeholder, type = "text", multiline = false, rows = 3 }: TInputProps) {
  const classes = `
    w-full 
    bg-[var(--t-surface)] 
    text-[var(--t-text)] 
    placeholder:text-[var(--t-text-muted)]
    border-[length:var(--t-border-w)] border-[var(--t-border)]
    rounded-[var(--t-radius)]
    px-4 py-3
    text-[length:var(--t-fs-sm)]
    font-[family-name:var(--t-font-body)]
    outline-none
    focus:border-[var(--t-primary)]
    focus:shadow-[var(--t-shadow-sm)]
    transition-all duration-200
  `;

  if (multiline) {
    return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className={classes} />;
  }
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={classes} />;
}

// ─── Badge / Price Tag ──────────────────────────────────────────────────────

interface TBadgeProps {
  children: ReactNode;
  variant?: "primary" | "accent" | "surface";
}

export function TBadge({ children, variant = "primary" }: TBadgeProps) {
  const variantMap: Record<string, string> = {
    primary: "bg-[var(--t-primary)] text-[var(--t-surface)]",
    accent: "bg-[var(--t-accent)] text-[var(--t-surface)]",
    surface: "bg-[var(--t-surface)] text-[var(--t-text)] border-[length:var(--t-border-w)] border-[var(--t-border)]",
  };

  return (
    <span className={`
      inline-flex items-center
      px-3 py-1
      text-[length:var(--t-fs-xs)] font-semibold
      rounded-[var(--t-radius)]
      shadow-[var(--t-shadow-sm)]
      ${variantMap[variant]}
    `}>
      {children}
    </span>
  );
}
