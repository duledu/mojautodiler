export default function InventoryLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-obsidian)] py-8 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="h-8 bg-zinc-800 rounded-lg w-48 mb-2" />
        <div className="h-4 bg-zinc-800/60 rounded w-64 mb-8" />

        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="h-3 bg-zinc-800 rounded w-24" />
                <div className="h-9 bg-zinc-800 rounded-lg" />
              </div>
            ))}
          </aside>

          {/* Grid skeleton */}
          <div className="flex-1 grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="aspect-[16/9] bg-zinc-800" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-zinc-800 rounded w-3/4" />
                  <div className="h-4 bg-zinc-800/60 rounded w-1/2" />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j} className="h-3 bg-zinc-800/60 rounded" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
