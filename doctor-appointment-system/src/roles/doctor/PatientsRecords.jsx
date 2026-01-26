import Card from "../../components/ui/Card";

const patients = [
  { id: 1, name: "Alice Patient", age: 30 },
  { id: 2, name: "Bob Patient", age: 45 },
];

export default function PatientRecords() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Patient Records</h1>

      <div className="space-y-3">
        {patients.map((p) => (
          <Card key={p.id}>
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-slate-500">
              Age: {p.age}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
