"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode, ButtonHTMLAttributes } from "react";
import { useRepMotion } from "../motion/MotionEngine";

// =============================================================================
// PRIMITIVE RENDERER (REP Component Library Core)
// =============================================================================
// These primitives read CSS custom properties injected by Style/Typography Engines.
// They also read Motion context to apply global animation styles.
// =============================================================================

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface RepButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const sizeMap: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[length:var(--rep-fs-xs)]",
  md: "px-6 py-3 text-[length:var(--rep-fs-sm)]",
  lg: "px-8 py-4 text-[length:var(--rep-fs-base)]",
};

export function RepButton({ variant = "primary", size = "md", icon, fullWidth, children, className = "", ...props }: RepButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-[family-name:var(--rep-font-button)] font-[number:var(--rep-weight-button)]
    tracking-[var(--rep-tracking-button)] leading-[var(--rep-lh-button)]
    uppercase /* based on transform token */
    rounded-[var(--rep-radius)] 
    transition-all duration-300 cursor-pointer
    active:scale-[0.97]
    disabled:opacity-50 disabled:pointer-events-none
    ${fullWidth ? "w-full" : ""}
    ${sizeMap[size]}
  `;

  const variantStyles: Record<ButtonVariant, string> = {
    primary: `
      bg-[var(--rep-primary)] text-[var(--rep-surface)]
      shadow-[var(--rep-shadow)]
      hover:brightness-110
    `,
    secondary: `
      bg-[var(--rep-secondary)] text-[var(--rep-surface)]
      shadow-[var(--rep-shadow)]
      hover:brightness-110
    `,
    outline: `
      bg-transparent text-[var(--rep-primary)] border-[1px] border-[var(--rep-border)]
      hover:bg-[var(--rep-primary)] hover:text-[var(--rep-surface)]
    `,
    ghost: `
      bg-transparent text-[var(--rep-text)] border-transparent
      hover:bg-[var(--rep-surface)]
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

interface RepCardProps {
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

export function RepCard({ children, className = "", hover = true, padding = "md" }: RepCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.3 } } : undefined}
      className={`
        bg-[var(--rep-surface)]
        border-[1px] border-[var(--rep-border)]
        rounded-[var(--rep-radius)]
        shadow-[var(--rep-shadow)]
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

export function RepSection({ children, className = "", id }: { children: ReactNode; className?: string; id?: string; }) {
  const motionContext = useRepMotion();
  
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={motionContext.variants.fadeUp}
      className={`
        w-full max-w-7xl mx-auto
        px-5 md:px-8 py-12 md:py-20
        ${className}
      `}
    >
      {children}
    </motion.section>
  );
}

// ─── Heading ────────────────────────────────────────────────────────────────

interface RepHeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | "display";
  children: ReactNode;
  className?: string;
}

export function RepHeading({ level = 2, children, className = "" }: RepHeadingProps) {
  const motionContext = useRepMotion();
  
  const Tag = (level === "display" ? "h1" : `h${level}`) as any;
  
  const tokenPrefix = level === "display" ? "display" : level === 1 ? "heading" : "title";
  
  let sizeClass = "";
  if (level === "display") sizeClass = "text-[length:var(--rep-fs-5xl)] md:text-[length:var(--rep-fs-6xl)]";
  if (level === 1) sizeClass = "text-[length:var(--rep-fs-4xl)] md:text-[length:var(--rep-fs-5xl)]";
  if (level === 2) sizeClass = "text-[length:var(--rep-fs-3xl)] md:text-[length:var(--rep-fs-4xl)]";
  if (level === 3) sizeClass = "text-[length:var(--rep-fs-2xl)] md:text-[length:var(--rep-fs-3xl)]";
  if (level === 4) sizeClass = "text-[length:var(--rep-fs-xl)] md:text-[length:var(--rep-fs-2xl)]";
  if (level === 5) sizeClass = "text-[length:var(--rep-fs-lg)] md:text-[length:var(--rep-fs-xl)]";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={motionContext.variants.fadeUp}
    >
      <Tag
        className={`
          font-[family-name:var(--rep-font-${tokenPrefix})]
          font-[number:var(--rep-weight-${tokenPrefix})]
          tracking-[var(--rep-tracking-${tokenPrefix})]
          leading-[var(--rep-lh-${tokenPrefix})]
          text-[var(--rep-text)]
          ${sizeClass}
          ${className}
        `}
      >
        {children}
      </Tag>
    </motion.div>
  );
}

// ─── Text ───────────────────────────────────────────────────────────────────

interface RepTextProps {
  children: ReactNode;
  className?: string;
  muted?: boolean;
  size?: "xs" | "sm" | "base" | "lg";
}

const textSizeMap: Record<string, string> = {
  xs: "text-[length:var(--rep-fs-xs)]",
  sm: "text-[length:var(--rep-fs-sm)]",
  base: "text-[length:var(--rep-fs-base)]",
  lg: "text-[length:var(--rep-fs-lg)]",
};

export function RepText({ children, className = "", muted = false, size = "base" }: RepTextProps) {
  return (
    <p className={`
      font-[family-name:var(--rep-font-body)]
      font-[number:var(--rep-weight-body)]
      leading-[var(--rep-lh-body)]
      tracking-[var(--rep-tracking-body)]
      ${textSizeMap[size]}
      ${muted ? "text-[var(--rep-text-muted)]" : "text-[var(--rep-text)]"}
      ${className}
    `}>
      {children}
    </p>
  );
}
