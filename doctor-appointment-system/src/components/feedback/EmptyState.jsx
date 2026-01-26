import Button from "../ui/Button";

export default function EmptyState({
  message = "No data available.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl">
        📂
      </div>

      <p className="text-slate-500 font-medium">
        {message}
      </p>

      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Refresh
        </Button>
      )}
    </div>
  );
}
