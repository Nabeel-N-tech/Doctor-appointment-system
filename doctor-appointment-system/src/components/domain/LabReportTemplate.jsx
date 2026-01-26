import React, { useRef } from 'react';
import Button from '../ui/Button';

export default function LabReportTemplate({ report, onClose }) {
    const contentRef = useRef();

    const handlePrint = () => {
        const printContent = contentRef.current;
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload();
        }
    };

    // Standard fallback data
    const mainReport = Array.isArray(report) ? report[0] : report;
    const patientName = mainReport.patient || "Patient";
    const doctorName = mainReport.doctor ? `Dr. ${mainReport.doctor}` : "Doctor";
    const date = new Date(mainReport.date).toLocaleDateString();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h2 className="font-bold text-gray-800">Lab Report Details</h2>
                    <div className="flex gap-2">
                        <Button onClick={handlePrint} className="bg-gray-800 text-white text-xs px-3 py-2 rounded">
                            Print Report
                        </Button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold px-2">
                            ✕ Close
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div ref={contentRef} className="p-8 overflow-y-auto print:p-0">
                    <div className="border-b-2 border-gray-800 pb-4 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">MediCare Diagnostics</h1>
                        <p className="text-sm text-gray-500">Official Laboratory Report</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm border p-4 bg-gray-50 rounded">
                        <div>
                            <p className="font-bold text-gray-500">Patient:</p>
                            <p className="text-gray-900">{patientName}</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-500">Date:</p>
                            <p className="text-gray-900">{date}</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-500">Doctor:</p>
                            <p className="text-gray-900">{doctorName}</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-500">Report ID:</p>
                            <p className="text-gray-900">#{report.id}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-bold text-lg border-b pb-2 mb-4">Test Results</h3>
                        <table className="w-full text-left text-sm border-collapse border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">Test Name</th>
                                    <th className="border p-2">Result</th>
                                    <th className="border p-2">Unit</th>
                                    <th className="border p-2">Reference</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Array.isArray(report) ? report : [report]).map((r, i) => (
                                    <tr key={r.id || i}>
                                        <td className="border p-2 font-medium">{r.test_name}</td>
                                        <td className="border p-2 font-bold">{r.observed_value}</td>
                                        <td className="border p-2">{r.unit}</td>
                                        <td className="border p-2">{r.reference_range}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {report.result && (
                        <div className="mb-6 p-4 bg-gray-50 border l-4 border-l-blue-500 rounded">
                            <h4 className="font-bold text-sm mb-2 text-blue-800">Summary</h4>
                            <p className="text-sm text-gray-800">{report.result}</p>
                        </div>
                    )}

                    {report.clinical_interpretation && (
                        <div className="mb-6">
                            <h4 className="font-bold text-sm mb-2">Clinical Interpretation</h4>
                            <p className="text-sm text-gray-700 italic border p-3 rounded">{report.clinical_interpretation}</p>
                        </div>
                    )}

                    <div className="mt-12 text-center text-xs text-gray-400">
                        <p>This report is electronically generated.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
