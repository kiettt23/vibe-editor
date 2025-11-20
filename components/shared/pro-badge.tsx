import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  variant?: "default" | "outline" | "secondary";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ProBadge({
  variant = "default",
  className,
  size = "sm",
}: ProBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-2.5 py-1",
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "font-semibold bg-linear-to-r from-purple-500 to-pink-500 text-white border-0",
        sizeClasses[size],
        className
      )}
    >
      PRO
    </Badge>
  );
}
