import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function EditorLoading() {
  return (
    <div className="h-screen flex">
      {/* Sidebar Skeleton */}
      <div className="w-80 border-r bg-background p-6 space-y-6">
        <Skeleton className="h-8 w-32" />

        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Canvas Area Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b bg-background p-4 flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <div className="flex-1" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-muted/30 flex items-center justify-center">
          <Card className="p-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Đang tải editor...</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
