"use client";

import React from "react";
import clsx from "clsx";
import { formatDisplayCopy } from "@/lib/copyFormatter";

interface BadgeProps {
  label: string;
  variant?: "quantum" | "classical" | "cyan" | "magenta" | "purple" | "default" | "success";
  size?: "xs" | "sm";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "default",
  size = "sm",
  className
}) => {
  const variantStyles = {
    quantum: "bg-[#181818] text-[#00F0FF] border-[#00F0FF]/30",
    classical: "bg-[#181818] text-[#FFB340] border-[#FFB340]/30",
    cyan: "bg-[#181818] text-[#00F0FF] border-[#00F0FF]/30",
    magenta: "bg-[#181818] text-[#FF00B4] border-[#FF00B4]/30",
    purple: "bg-[#181818] text-[#BD93F9] border-[#BD93F9]/30",
    success: "bg-[#181818] text-[#30D158] border-[#30D158]/30",
    default: "bg-[#181818] text-[#9B9B9B] border-[#313131]"
  }[variant];

  const sizeStyles = {
    xs: "px-2 py-0.5 text-[11px] font-mono",
    sm: "px-2.5 py-1 text-xs font-mono font-medium"
  }[size];

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border tracking-wide uppercase select-none",
        variantStyles,
        sizeStyles,
        className
      )}
    >
      {formatDisplayCopy(label)}
    </span>
  );
};

