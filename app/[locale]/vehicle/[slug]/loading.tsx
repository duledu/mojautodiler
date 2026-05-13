export default function VehicleLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-obsidian)] py-8 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="h-4 bg-zinc-800 rounded w-64 mb-6" />

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left col */}
          <div className="space-y-6">
            {/* Gallery */}
            <div className="aspect-[16/9] bg-zinc-900 border border-zinc-800 rounded-2xl" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-20 h-14 bg-zinc-900 border border-zinc-800 rounded-lg shrink-0" />
              ))}
            </div>

            {/* Specs tabs */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-9 bg-zinc-800 rounded-lg w-24" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-zinc-800 rounded w-20" />
                    <div className="h-4 bg-zinc-800/60 rounded w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="h-7 bg-zinc-800 rounded w-3/4" />
              <div className="h-10 bg-zinc-800 rounded w-1/2" />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-zinc-800 rounded-lg" />
                ))}
              </div>
              <div className="h-12 bg-zinc-800 rounded-lg" />
              <div className="h-12 bg-zinc-800/60 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
