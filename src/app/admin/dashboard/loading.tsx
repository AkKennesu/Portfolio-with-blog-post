export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/50">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-md" />
          <div className="h-4 w-72 bg-muted/60 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-32 bg-muted rounded-lg" />
          <div className="h-9 w-36 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded-lg" />
            </div>
            <div className="h-9 w-20 bg-muted/80 rounded" />
            <div className="h-3 w-36 bg-muted/50 rounded" />
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Inquiries Skeleton */}
        <div className="lg:col-span-7 rounded-xl border border-border/60 bg-card/60 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted/60 rounded" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border border-border/40 bg-muted/20 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted/60 rounded" />
                </div>
                <div className="h-3 w-full bg-muted/40 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* System Operations Skeleton */}
        <div className="lg:col-span-5 rounded-xl border border-border/60 bg-card/60 p-6 space-y-5">
          <div className="h-5 w-44 bg-muted rounded pb-3 border-b border-border/40" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border/30">
                <div className="h-3.5 w-28 bg-muted rounded" />
                <div className="h-5 w-20 bg-muted/80 rounded-full" />
              </div>
            ))}
          </div>
          <div className="pt-4 space-y-3">
            <div className="h-10 w-full bg-muted rounded-lg" />
            <div className="h-10 w-full bg-muted/60 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
