export default function Input({
  label,
  type = "text",
  className = "",
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
}
