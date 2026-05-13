export default function AdminLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-zinc-800 rounded-lg w-40" />
          <div className="h-4 bg-zinc-800/60 rounded w-56" />
        </div>
        <div className="h-10 bg-zinc-800 rounded-lg w-32" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="w-9 h-9 bg-zinc-800 rounded-lg" />
            <div className="h-6 bg-zinc-800 rounded w-12" />
            <div className="h-3 bg-zinc-800/60 rounded w-20" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="px-5 py-4 border-b border-zinc-800">
            <div className="h-5 bg-zinc-800 rounded w-32" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-zinc-800/50 flex gap-3">
              <div className="w-8 h-8 bg-zinc-800 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-32" />
                <div className="h-3 bg-zinc-800/60 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl h-44" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl h-56" />
        </div>
      </div>
    </div>
  );
}
