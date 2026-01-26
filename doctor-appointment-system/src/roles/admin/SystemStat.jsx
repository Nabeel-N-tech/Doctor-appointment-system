import Card from "../../components/ui/Card";

export default function SystemStats() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">System Statistics</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Daily Logins</p>
          <p className="text-2xl font-bold">120</p>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">Active Sessions</p>
          <p className="text-2xl font-bold">34</p>
        </Card>

        <Card>
          <p className="text-sm text-slate-500">System Health</p>
          <p className="text-2xl font-bold text-green-600">
            Stable
          </p>
        </Card>
      </div>
    </div>
  );
}
