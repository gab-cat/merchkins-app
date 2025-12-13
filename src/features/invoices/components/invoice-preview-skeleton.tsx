import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function InvoicePreviewSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="rounded-2xl bg-primary/20 p-8">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="text-right">
            <Skeleton className="h-7 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Invoice Details Card Skeleton */}
      <Card className="-mt-8 mx-4 relative z-10 shadow-lg border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payee Details Skeleton */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-1 h-5" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="bg-muted/50 rounded-xl p-5">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary Skeleton */}
      <Card className="border-0 shadow-lg bg-slate-900">
        <CardContent className="p-6">
          <Skeleton className="h-4 w-36 mb-6 bg-slate-700" />
          <div className="space-y-4 mb-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between py-3 border-b border-white/10">
                <Skeleton className="h-4 w-32 bg-slate-700" />
                <Skeleton className="h-4 w-24 bg-slate-700" />
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t-2 border-[#adfc04]/30">
            <Skeleton className="h-5 w-24 bg-slate-700" />
            <Skeleton className="h-8 w-36 bg-slate-700" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-6 text-center">
              <Skeleton className="h-5 w-5 mx-auto mb-2" />
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Table Skeleton */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="p-6 pb-4">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="p-4">
            <Skeleton className="h-10 w-full mb-2 rounded" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full mb-1 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
