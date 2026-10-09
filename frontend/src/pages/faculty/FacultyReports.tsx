import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FileText, Download, Printer } from 'lucide-react';

export const FacultyReports: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const res = await api.getReportsSummary();
        setSummary(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, []);

  const handleExportCSV = async () => {
    try {
      const csvData = await api.exportStudentsCSV();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unisphere_faculty_cohort_report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Export failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
            Department Performance Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated metrics for student mentoring and departmental review meetings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#DCE5F3] hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#245BB5] hover:bg-[#102B57] text-white text-xs font-bold rounded-lg shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading department report...</div>
      ) : summary ? (
        <div className="uni-card p-6 space-y-6">
          <h2 className="text-lg font-bold text-[#10213A] border-b border-slate-100 pb-3">
            Departmental Analytics Brief
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Monitored</span>
              <div className="text-2xl font-bold text-[#10213A] mt-1">{summary.total_students}</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-[10px] uppercase font-bold text-blue-700">Mean Success Score</span>
              <div className="text-2xl font-bold text-blue-900 mt-1">{summary.average_success_score} / 100</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Average CGPA</span>
              <div className="text-2xl font-bold text-[#10213A] mt-1">{summary.average_cgpa}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Mean Attendance</span>
              <div className="text-2xl font-bold text-[#10213A] mt-1">{summary.average_attendance}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1">
              <span className="text-xs font-bold text-amber-900">Academic Risk Cohort</span>
              <div className="text-xl font-bold text-amber-800">
                {summary.high_academic_risk_count} students ({summary.high_academic_risk_pct}%)
              </div>
              <p className="text-[11px] text-amber-700">Identified via attendance shortage and internal mark drop</p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-1">
              <span className="text-xs font-bold text-blue-900">Placement Risk Cohort</span>
              <div className="text-xl font-bold text-blue-800">
                {summary.high_placement_risk_count} students ({summary.high_placement_risk_pct}%)
              </div>
              <p className="text-[11px] text-blue-700">Identified via DSA coding & aptitude benchmarks</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
