"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Lock } from "lucide-react";
import { ProBadge } from "./pro-badge";
import { PRO_FEATURES } from "@/types/subscription";
import { getProFeatureName } from "@/lib/subscription/utils";

interface ProGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
  featureDescription?: string;
}

export function ProGateModal({
  open,
  onOpenChange,
  featureName = "Tính năng này",
  featureDescription,
}: ProGateModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    // TODO: Integrate with Stripe payment
    // For now, redirect to pricing page
    window.location.href = "/pricing";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-linear-to-r from-purple-500 to-pink-500">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <ProBadge size="md" />
          </div>
          <DialogTitle className="text-2xl">
            Nâng cấp lên Pro để mở khóa
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {featureDescription || (
              <>
                <span className="font-semibold text-foreground">
                  {featureName}
                </span>{" "}
                chỉ dành cho thành viên Pro. Nâng cấp ngay để trải nghiệm đầy đủ
                tính năng!
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <p className="font-semibold">Các tính năng Pro bao gồm:</p>
          </div>
          <ul className="space-y-2 pl-1">
            {PRO_FEATURES.slice(0, 6).map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm">{getProFeatureName(feature)}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Để sau
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isLoading ? "Đang xử lý..." : "Nâng cấp ngay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
