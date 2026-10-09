import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FileText, Download, Printer, Filter, CheckCircle2 } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [department, setDepartment] = useState('all');
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await api.getReportsSummary(department !== 'all' ? department : undefined);
      setSummary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [department]);

  const handleExportCSV = async () => {
    try {
      const csvData = await api.exportStudentsCSV(
        department !== 'all' ? department : undefined
      );
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unisphere_institutional_report_${department}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Export failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
            Institutional Reports & Auditing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official performance summaries, department breakdowns, and exportable datasets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#DCE5F3] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#245BB5] hover:bg-[#102B57] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full CSV Dataset</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="uni-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Filter Scope:</span>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="text-xs py-1.5 px-3 bg-white border border-[#DCE5F3] rounded-lg text-slate-700 font-semibold"
          >
            <option value="all">Entire Institution (All Departments)</option>
            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Communication Engineering">Electronics & Communication</option>
            <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>
        </div>
        <span className="text-xs text-slate-400">
          Generated: {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* Official Executive Summary Sheet */}
      <div className="uni-card p-8 bg-white space-y-6 print:border-none print:shadow-none">
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-xl font-bold text-[#102B57]">
              Executive Student Success Summary
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scope: {department === 'all' ? 'Institutional Campus-Wide' : department}
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            UniSphere AI • v1.0.0
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Generating report summary...</div>
        ) : summary ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Cohort Enrolled
                </span>
                <div className="text-2xl font-bold text-[#10213A] mt-1">
                  {summary.total_students}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[10px] uppercase font-bold text-blue-700">
                  Mean Success Score
                </span>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  {summary.average_success_score} / 100
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Average CGPA
                </span>
                <div className="text-2xl font-bold text-[#10213A] mt-1">
                  {summary.average_cgpa} / 10.0
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Mean Attendance
                </span>
                <div className="text-2xl font-bold text-[#10213A] mt-1">
                  {summary.average_attendance}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 space-y-1">
                <span className="text-xs font-bold text-amber-900">Academic Risk Cohort</span>
                <div className="text-xl font-bold text-amber-800">
                  {summary.high_academic_risk_count} ({summary.high_academic_risk_pct}%)
                </div>
                <p className="text-[11px] text-amber-700">CGPA or attendance below baseline</p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200 space-y-1">
                <span className="text-xs font-bold text-blue-900">Placement Risk Cohort</span>
                <div className="text-xl font-bold text-blue-800">
                  {summary.high_placement_risk_count} ({summary.high_placement_risk_pct}%)
                </div>
                <p className="text-[11px] text-blue-700">Coding or aptitude below recruitment threshold</p>
              </div>

              <div className="p-4 rounded-xl bg-red-50/40 border border-red-200 space-y-1">
                <span className="text-xs font-bold text-red-900">Combined High Risk</span>
                <div className="text-xl font-bold text-red-800">
                  {summary.high_combined_risk_count} ({summary.high_combined_risk_pct}%)
                </div>
                <p className="text-[11px] text-red-700">Immediate mentoring triage required</p>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <h4 className="text-xs font-bold text-[#10213A]">
                Intervention & Mentoring Program Metrics
              </h4>
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
                <div>
                  Total Assigned Cases: <strong>{summary.total_interventions}</strong>
                </div>
                <div>
                  Successfully Resolved: <strong>{summary.completed_interventions}</strong>
                </div>
                <div>
                  Measurable Improvements Recorded: <strong>{summary.improved_outcomes_count}</strong>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>UniSphere AI Smart Campus Analytics</span>
              <span>HacXLerate 2026 • KPMG in India Challenge</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
