import Button from "../ui/Button";

export default function ErrorState({
  message = "Something went wrong.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
      <div className="text-4xl">⚠️</div>

      <p className="text-slate-700 font-medium">
        {message}
      </p>

      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
