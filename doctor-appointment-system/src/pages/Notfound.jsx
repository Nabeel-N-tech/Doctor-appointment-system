import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-center px-4">
      <h1 className="text-6xl font-bold text-slate-400">404</h1>
      <p className="text-lg text-slate-600 mt-2">
        Page not found
      </p>

      <Button
        className="mt-6"
        onClick={() => window.location.href = "/"}
      >
        Go Home
      </Button>
    </div>
  );
}
