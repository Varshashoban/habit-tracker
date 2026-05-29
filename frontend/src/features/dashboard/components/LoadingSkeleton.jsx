function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {["one", "two", "three"].map((item) => (
        <div
          className="h-32 animate-pulse rounded-lg border border-white/10 bg-white/[0.06]"
          key={item}
        />
      ))}
    </div>
  );
}

export default LoadingSkeleton;
