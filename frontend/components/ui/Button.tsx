"use client";

import React from "react";
import clsx from "clsx";
import { formatDisplayCopy } from "@/lib/copyFormatter";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "accent" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "secondary",
  size = "md",
  children,
  icon,
  className,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5 font-semibold"
  }[size];

  const variantClasses = {
    primary:
      "bg-white text-black border-white hover:bg-[#E1E1E1] shadow-[0_0_20px_rgba(255,255,255,0.15)]",
    secondary:
      "bg-[#181818] text-[#E1E1E1] border-[#313131] hover:bg-[#272727] hover:border-[#444444]",
    ghost:
      "bg-transparent text-[#9B9B9B] border-transparent hover:text-white hover:bg-[#181818]",
    accent:
      "bg-[#181818] text-[#00F0FF] border-[#00F0FF]/40 hover:bg-[#00F0FF]/10 shadow-[0_0_15px_rgba(0,240,255,0.2)]",
    danger:
      "bg-[#181818] text-[#FF453A] border-[#FF453A]/40 hover:bg-[#FF453A]/10"
  }[variant];

  const renderedContent =
    typeof children === "string" ? formatDisplayCopy(children) : children;

  return (
    <button
      className={clsx(baseClasses, sizeClasses, variantClasses, className)}
      style={{
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)"
      }}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{renderedContent}</span>
    </button>
  );
};

