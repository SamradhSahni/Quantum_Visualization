"use client";

import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: "canvas" | "deep" | "card" | "hover";
  outerRadius?: number;
  gap?: number;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  surface = "card",
  outerRadius = 12,
  gap = 4,
  className,
  children,
  style,
  ...props
}) => {
  const surfaceClasses = {
    canvas: "bg-[#000000]",
    deep: "bg-[#181818]",
    card: "bg-[#1F1F1F]",
    hover: "bg-[#272727]"
  }[surface];

  return (
    <div
      className={clsx(
        "border border-[#313131] transition-colors duration-150 relative overflow-hidden",
        surfaceClasses,
        className
      )}
      style={{
        borderRadius: `${outerRadius}px`,
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

