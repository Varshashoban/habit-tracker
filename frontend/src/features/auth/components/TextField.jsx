function TextField({ error, label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <input
        className="w-full rounded-md border border-white/15 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-200/60 focus:bg-black/40"
        {...props}
      />
      {error && <span className="mt-2 block text-sm text-rose-200">{error}</span>}
    </label>
  );
}

export default TextField;
