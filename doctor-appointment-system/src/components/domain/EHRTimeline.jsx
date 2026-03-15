import React from 'react';

export default function EHRTimeline({ records }) {
    if (!records || records.length === 0) {
        return (
            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No medical records found.</p>
            </div>
        );
    }

    return (
        <div className="relative border-l-2 border-slate-100 ml-4 py-4 space-y-8">
            {records.map((record, index) => {
                const dateStr = new Date(record.date).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric'
                });

                return (
                    <div key={record.id || index} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-white border-2 border-teal-500 shadow-sm flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        </div>

                        {/* Record Content */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                                        {dateStr}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">Dr. {record.doctor_name || 'Unknown'}</p>
                                </div>
                                {record.diagnosis && (
                                    <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Diagnosis Made
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4">
                                {record.diagnosis && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Diagnosis</h4>
                                        <p className="text-sm text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            {record.diagnosis}
                                        </p>
                                    </div>
                                )}

                                {record.notes && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Clinical Notes</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            {record.notes}
                                        </p>
                                    </div>
                                )}

                                {record.treatment_plan && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Treatment Plan</h4>
                                        <p className="text-sm text-slate-700 font-medium bg-teal-50/50 p-3 rounded-xl border border-teal-100/50">
                                            {record.treatment_plan}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
