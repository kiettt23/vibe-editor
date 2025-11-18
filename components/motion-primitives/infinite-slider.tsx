"use client";

import React from "react";

interface InfiniteSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "left" | "right";
  blurIntensity?: number;
  speed?: number;
  speedOnHover?: number;
  gap?: number;
  children: React.ReactNode;
}

export function InfiniteSlider({
  children,
  direction = "left",
  blurIntensity = 0,
  speed,
  speedOnHover,
  gap,
  className,
  ...props
}: InfiniteSliderProps) {
  return (
    <div className={`flex overflow-hidden ${className || ""}`} {...props}>
      <div className="flex animate-scroll">{children}</div>
    </div>
  );
}
