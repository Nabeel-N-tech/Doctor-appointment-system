import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import apiClient from '../../api/apiClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import toast from 'react-hot-toast';

export default function AiInsights() {
    const [generating, setGenerating] = useState(false);
    const [insightData, setInsightData] = useState(null);

    useEffect(() => {
        handleGenerate();
    }, []);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await apiClient.get('/ai-insights/');
            const data = res.data;

            // Transform Age Data for Chart
            const ageChartData = Object.entries(data.demographics.age).map(([range, count]) => ({
                name: range,
                patients: count
            }));

            // Gender Data for Pie Chart (if needed, but bar is simpler for age)

            // Derive meaningful insights
            const topSymptoms = Object.entries(data.clinical.top_symptoms)
                .sort(([, a], [, b]) => b - a);

            const dominantSymptom = topSymptoms.length > 0 ? topSymptoms[0][0] : null;

            const summary = dominantSymptom
                ? `Analysis of ${data.overview.appointments_7d} recent appointments indicates a cluster of "${dominantSymptom}" cases.`
                : `Patient flow is stable. ${data.overview.appointments_7d} appointments scheduled in the last 7 days.`;

            const patterns = [
                { label: "Active Patients", value: data.overview.total_patients, trend: "neutral" },
                { label: "7-Day Volume", value: data.overview.appointments_7d, trend: "up" },
            ];

            if (dominantSymptom) {
                patterns.push({ label: `Top Symptom: ${dominantSymptom}`, value: topSymptoms[0][1], trend: "alert" });
            }

            setInsightData({
                summary,
                ageChartData,
                patterns,
                recommendations: dominantSymptom ? [
                    `Review protocols for ${dominantSymptom} management.`,
                    "Ensure adequate stock of relevant medications.",
                    "Monitor for potential outbreak patterns."
                ] : [
                    "Maintain standard operational protocols.",
                    "Review long-term patient care plans.",
                    "Schedule follow-ups for chronic patients."
                ]
            });
            toast.success("Insights Generated");

        } catch (err) {
            console.error(err);
            toast.error("Connection failed. Using simulation for demo.");
            // Fallback simulation so user sees something if backend fails (e.g. auth issue)
            setTimeout(() => {
                setInsightData({
                    summary: "Simulation: High prevalence of seasonal allergies detected.",
                    ageChartData: [
                        { name: '0-18', patients: 12 },
                        { name: '19-35', patients: 19 },
                        { name: '36-50', patients: 8 },
                        { name: '51+', patients: 14 },
                    ],
                    patterns: [
                        { label: "Simulated Volume", value: 45, trend: "up" },
                        { label: "Viral Cases", value: 12, trend: "alert" }
                    ],
                    recommendations: ["This is a fallback simulation.", "Check backend connection."]
                });
                setGenerating(false);
            }, 1000);
            return;
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">AI Assistant</span>
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">Live Data</span>
                </h1>
                <p className="text-slate-500 font-medium mt-3 text-lg max-w-2xl">
                    Real-time database analysis & predictive insights.
                </p>
            </div>

            {/* Main Banner / Action Area */}
            <div className="group relative rounded-[3rem] p-1 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20">
                {/* Animated Gradient Border */}
                {/* Animated Gradient Border - Optimized */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20" />

                <div className="relative bg-[#0F172A] rounded-[2.8rem] p-8 md:p-14 overflow-hidden">
                    {/* Background Elements */}
                    {/* Background Elements - Optimized */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[60px]"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-600/10 rounded-full blur-[60px]"></div>

                    <div className="relative z-10 grid md:grid-cols-5 gap-12 items-center">
                        <div className="md:col-span-3 space-y-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-6 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                                    System Online
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
                                    Clinical Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Engine</span>
                                </h2>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
                                    Harness the power of real-time predictive analytics. Analyze patient demographics, symptom clusters, and appointment volume instantly.
                                </p>
                            </div>

                            {generating && (
                                <div className="flex items-center gap-3 text-indigo-400 font-bold animate-pulse mt-4">
                                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs uppercase tracking-widest">Processing Data Stream...</span>
                                </div>
                            )}
                        </div>

                        <div className="hidden md:flex md:col-span-2 items-center justify-center perspective-1000">
                            <div className="relative w-full aspect-square max-w-[320px]">
                                {/* Central Orb */}
                                <div className={`absolute inset-0 m-auto w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 blur-md opacity-80 animate-float ${generating ? 'scale-110 brightness-125' : ''} transition-all duration-700`}></div>

                                {/* Orbiting Rings */}
                                <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-spin-slow"></div>
                                <div className="absolute inset-4 border border-violet-500/20 rounded-full animate-spin-reverse-slow"></div>
                                <div className="absolute inset-8 border border-white/10 rounded-full animate-pulse"></div>

                                {/* Floating Modules */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 bg-[#0F172A] border border-indigo-500/30 px-3 py-1 rounded-lg text-[9px] font-bold text-indigo-300 shadow-lg shadow-indigo-500/20">
                                    DEMOGRAPHICS
                                </div>
                                <div className="absolute bottom-10 right-0 bg-[#0F172A] border border-violet-500/30 px-3 py-1 rounded-lg text-[9px] font-bold text-violet-300 shadow-lg shadow-violet-500/20 transform rotate-12">
                                    PATHOLOGY
                                </div>
                                <div className="absolute top-1/3 left-0 -ml-4 bg-[#0F172A] border border-emerald-500/30 px-3 py-1 rounded-lg text-[9px] font-bold text-emerald-300 shadow-lg shadow-emerald-500/20 transform -rotate-6">
                                    VITALS
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {insightData && (
                <div className="space-y-6 animate-slide-up">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Analysis Results</h3>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Summary Card */}
                        <Card className="col-span-1 lg:col-span-2 p-8 border-l-8 border-l-indigo-500 bg-gradient-to-br from-white to-indigo-50/30">
                            <h4 className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-xs mb-3">
                                <span className="text-xl">⚡</span> Evaluation
                            </h4>
                            <p className="text-xl font-bold text-slate-800 leading-relaxed">
                                {insightData.summary}
                            </p>

                            {/* Key Stats Row */}
                            <div className="flex gap-4 mt-6">
                                {insightData.patterns.map((p, i) => (
                                    <div key={i} className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.label}</span>
                                        <span className={`font-black text-lg ${p.trend === 'alert' ? 'text-rose-600' : 'text-slate-800'}`}>{p.value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Patient Age Distribution Chart */}
                        <Card className="p-6 flex flex-col justify-between">
                            <div>
                                <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-4">Patient Demographics (Age)</h4>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={insightData.ageChartData}>
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                cursor={{ fill: '#f1f5f9' }}
                                            />
                                            <Bar dataKey="patients" radius={[6, 6, 6, 6]}>
                                                {insightData.ageChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#d946ef', '#10b981'][index % 4]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <p className="text-center text-[10px] text-slate-400 font-medium mt-2">Distribution by Age Metrics</p>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-indigo-900 text-white rounded-[2rem] p-8 shadow-xl">
                        <h4 className="font-black text-indigo-200 uppercase tracking-widest text-xs mb-6">AI Recommendations</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            {insightData.recommendations.map((rec, i) => (
                                <div key={i} className="flex gap-4 items-start bg-white/10 p-4 rounded-xl border border-white/5 hover:bg-white/20 transition-colors">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">{i + 1}</span>
                                    <p className="font-bold text-sm text-indigo-50">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
