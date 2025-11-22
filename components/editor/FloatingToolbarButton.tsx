"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FloatingToolbarButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}

export function FloatingToolbarButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  className,
}: FloatingToolbarButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant={active ? "default" : "secondary"}
      size="icon"
      className={cn(
        "h-14 w-14 rounded-full shadow-lg transition-all",
        "hover:scale-110 active:scale-95",
        active && "ring-2 ring-primary ring-offset-2",
        className
      )}
      aria-label={label}
    >
      <Icon className="h-6 w-6" />
    </Button>
  );
}
