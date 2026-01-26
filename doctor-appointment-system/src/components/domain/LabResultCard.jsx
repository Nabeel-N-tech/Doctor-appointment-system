export default function LabResultCard({ report, onClick }) {
    return (
        <div
            onClick={onClick}
            className="border border-slate-100 bg-white p-5 rounded-2xl cursor-pointer hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50 transition-all mb-4 flex justify-between items-center group border-l-4 border-l-teal-500"
        >
            <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Patient: {report.patient}
                </p>
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight group-hover:text-teal-700 transition-colors">
                    {report.test_name}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold mt-1">
                    📅 {new Date(report.date).toLocaleDateString()}
                </p>
            </div>

            <div className="text-right">
                <div className="flex items-baseline justify-end gap-1">
                    <span className="font-black text-slate-900 text-xl">
                        {report.observed_value || "--"}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                        {report.unit}
                    </span>
                </div>
                <div className="text-[10px] text-teal-600 font-black uppercase mt-2 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Check Report <span>→</span>
                </div>
            </div>
        </div>
    );
}
