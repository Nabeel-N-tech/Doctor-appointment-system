import { useEffect, useState } from "react";
import { getLabReports } from "../../api/lab.api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LabReportTemplate from "../../components/domain/LabReportTemplate";
import LabResultCard from "../../components/domain/LabResultCard";

export default function LabReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    getLabReports()
      .then(setReports)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Lab Reports</h1>
          <p className="text-slate-500 text-lg mt-2">View and download your clinical test results.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 hidden md:block">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{reports.length} Reports Available</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {reports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="text-6xl mb-4 opacity-20">🔬</div>
            <h3 className="text-xl font-bold text-slate-700">No reports found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Once your tests are processed, your digital reports will appear here.</p>
          </div>
        ) : (
          reports.map((report) => (
            <LabResultCard
              key={report.id}
              report={report}
              onClick={() => setSelectedReport(report)}
            />
          ))
        )}
      </div>

      {selectedReport && (
        <LabReportTemplate
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
