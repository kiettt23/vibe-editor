"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressiveBlurProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "top" | "bottom" | "left" | "right";
  blurIntensity?: number;
  children?: React.ReactNode;
}

export function ProgressiveBlur({
  children,
  className,
  direction,
  blurIntensity,
  ...props
}: ProgressiveBlurProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
    </div>
  );
}
