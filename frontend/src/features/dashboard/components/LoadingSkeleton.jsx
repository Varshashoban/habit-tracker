function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["one", "two", "three", "four"].map((item) => (
          <div
            className="h-32 animate-pulse rounded-lg border border-white/10 bg-white/[0.06]"
            key={item}
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_24rem]">
        <div className="h-80 animate-pulse rounded-lg border border-white/10 bg-white/[0.05]" />
        <div className="h-80 animate-pulse rounded-lg border border-white/10 bg-white/[0.05]" />
      </div>
    </div>
  );
}

export default LoadingSkeleton;
