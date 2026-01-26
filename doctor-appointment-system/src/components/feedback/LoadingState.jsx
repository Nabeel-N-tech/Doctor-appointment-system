export default function LoadingState({
  message = "Loading...",
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      <p className="text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}
