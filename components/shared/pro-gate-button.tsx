"use client";

import { useState, ReactNode } from "react";
import { ProBadge } from "./pro-badge";
import { ProGateModal } from "./pro-gate-modal";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface ProGateButtonProps {
  children: ReactNode;
  isPro: boolean;
  featureName: string;
  featureDescription?: string;
  showBadge?: boolean;
  disabled?: boolean;
  className?: string;
  onProClick?: () => void;
}

export function ProGateButton({
  children,
  isPro,
  featureName,
  featureDescription,
  showBadge = true,
  disabled = false,
  className,
  onProClick,
}: ProGateButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!isPro && !disabled) {
      e.preventDefault();
      e.stopPropagation();
      setShowModal(true);
      onProClick?.();
    }
  };

  return (
    <>
      <div
        className={cn(
          "relative inline-flex items-center gap-2",
          !isPro && !disabled && "cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={handleClick}
      >
        {/* Content */}
        <div
          className={cn(
            "relative",
            !isPro && !disabled && "pointer-events-none"
          )}
        >
          {children}
        </div>

        {/* Pro Badge/Lock Icon */}
        {!isPro && showBadge && (
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <ProBadge size="sm" />
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <ProGateModal
        open={showModal}
        onOpenChange={setShowModal}
        featureName={featureName}
        featureDescription={featureDescription}
      />
    </>
  );
}
