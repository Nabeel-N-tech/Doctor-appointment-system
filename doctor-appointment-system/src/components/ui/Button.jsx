export default function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  disabled = false,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

  const variants = {
    primary:
      "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 focus:ring-teal-500",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm focus:ring-slate-200",
    danger:
      "bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200 shadow-sm focus:ring-red-500",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    outline:
      "bg-transparent border-2 border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
