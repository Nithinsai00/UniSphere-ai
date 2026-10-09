import React, { useState, useEffect } from 'react';
import { api, getToken } from '../../services/api';
import {
  FileText,
  Download,
  Printer,
  Filter,
  Users,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Building,
  CheckCircle2,
  RefreshCw,
  Search,
  Eye,
  Trash2,
  Sparkles,
  X,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface ReportHistoryItem {
  id: number;
  report_name: string;
  report_type: string;
  category: string;
  department: string;
  academic_year: string;
  risk_level: string;
  date_range: string;
  filters_applied: any;
  summary_metrics: any;
  status: string;
  file_format: string;
  generated_by: string;
  created_at: string;
}

interface GeneratedPreview {
  report_id: number;
  report_title: string;
  report_type: string;
  category: string;
  description: string;
  generated_at: string;
  filters: any;
  summary_metrics: Record<string, any>;
  columns: string[];
  rows: any[][];
  total_records: number;
}

export const AdminReports: React.FC = () => {
  // Summary Metrics State
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  // Report Generator Form State
  const [reportType, setReportType] = useState('student_success_score');
  const [department, setDepartment] = useState('all');
  const [academicYear, setAcademicYear] = useState('all');
  const [riskLevel, setRiskLevel] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Generated Report Preview State
  const [preview, setPreview] = useState<GeneratedPreview | null>(null);
  const [previewSearch, setPreviewSearch] = useState('');

  // Report History State
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Notification Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSummary();
    loadHistory();
  }, []);

  const loadSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const res = await api.getReportsSummary();
      setSummaryData(res);
    } catch (err) {
      console.error('Failed to load reports summary:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await api.getReportHistory();
      setHistory(res || []);
    } catch (err) {
      console.error('Failed to load report history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleGenerateReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const payload = {
        report_type: reportType,
        department: department !== 'all' ? department : undefined,
        academic_year: academicYear !== 'all' ? academicYear : undefined,
        risk_level: riskLevel !== 'all' ? riskLevel : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      const result = await api.generateReport(payload);
      setPreview(result);
      setNotification({
        type: 'success',
        text: `Report "${result.report_title}" generated successfully with ${result.total_records} records.`,
      });
      setTimeout(() => setNotification(null), 4000);

      // Refresh history list
      loadHistory();
    } catch (err: any) {
      setGenerationError(err?.message || 'Failed to generate report. Please check server connection.');
      setNotification({
        type: 'error',
        text: err?.message || 'Report generation failed.',
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCSV = async (typeToExport?: string, deptToExport?: string, yrToExport?: string, rkToExport?: string) => {
    try {
      const token = getToken();
      const q = new URLSearchParams();
      q.append('report_type', typeToExport || (preview ? preview.report_type : reportType));
      if ((deptToExport || department) !== 'all') q.append('department', deptToExport || department);
      if ((yrToExport || academicYear) !== 'all') q.append('academic_year', yrToExport || academicYear);
      if ((rkToExport || riskLevel) !== 'all') q.append('risk_level', rkToExport || riskLevel);

      const res = await fetch(`/api/reports/export?${q.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('CSV Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().split('T')[0];
      a.download = `unisphere_${typeToExport || reportType}_report_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setNotification({
        type: 'success',
        text: 'CSV report downloaded successfully.',
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Export failed');
    }
  };

  const handleDeleteHistory = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this report from history?')) return;
    try {
      await api.deleteReportHistory(id);
      setHistory((prev) => prev.filter((r) => r.id !== id));
      setNotification({ type: 'success', text: 'Report record removed from history.' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to delete history record:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Summary Metrics Values
  const cards = summaryData?.summary_cards || {
    total_students: 360,
    avg_success_score: 74.2,
    avg_attendance: 80.9,
    at_risk_count: 145,
  };

  // Filter preview rows by search
  const filteredRows = (preview?.rows || []).filter((row) =>
    row.some((cell) => String(cell).toLowerCase().includes(previewSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in duration-150 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E3E2D]">Reports & Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-[#0B4A2B] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Live Database Integration
            </span>
          </div>
          <p className="text-xs text-[#52796F] mt-1">
            Reports summarize student performance, attendance, engagement, and placement readiness across all departments.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => {
              loadSummary();
              loadHistory();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#DDE7DF] hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Refresh All Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#DDE7DF] hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Summary Cards (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-[#DDE7DF] shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0B4A2B] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Total Students
            </span>
            <span className="text-2xl font-bold text-[#1E3E2D]">
              {isLoadingSummary ? '...' : cards.total_students}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Enrolled cohort</span>
          </div>
        </div>

        {/* Card 2: Average Student Success Score */}
        <div className="bg-white p-5 rounded-2xl border border-[#DDE7DF] shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Avg Success Score
            </span>
            <span className="text-2xl font-bold text-blue-900">
              {isLoadingSummary ? '...' : `${cards.avg_success_score}/100`}
            </span>
            <span className="text-[10px] text-blue-600 block mt-0.5">Composite index</span>
          </div>
        </div>

        {/* Card 3: Average Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-[#DDE7DF] shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Avg Attendance
            </span>
            <span className="text-2xl font-bold text-[#1E3E2D]">
              {isLoadingSummary ? '...' : `${cards.avg_attendance}%`}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">University target: ≥75%</span>
          </div>
        </div>

        {/* Card 4: Number of At-Risk Students */}
        <div className="bg-white p-5 rounded-2xl border border-[#DDE7DF] shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              At-Risk Students
            </span>
            <span className="text-2xl font-bold text-red-600">
              {isLoadingSummary ? '...' : cards.at_risk_count}
            </span>
            <span className="text-[10px] text-red-500 block mt-0.5">High & moderate risk</span>
          </div>
        </div>
      </div>

      {/* 3. Report Generation Panel */}
      <div className="bg-white rounded-2xl border border-[#DDE7DF] shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-[#1E3E2D] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#0B4A2B]" />
              Generate Academic & Institutional Report
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select report type, filter parameters, and click Generate to extract real-time insights from database records
            </p>
          </div>
        </div>

        {generationError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{generationError}</span>
          </div>
        )}

        <form onSubmit={handleGenerateReport} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
            {/* 1. Report Type */}
            <div className="lg:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Report Type <span className="text-red-500">*</span>
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
              >
                <option value="student_success_score">Student Success Score Report</option>
                <option value="at_risk_students">At-Risk Students Report</option>
                <option value="attendance">Attendance Report</option>
                <option value="academic_performance">Academic Performance & Backlogs Report</option>
                <option value="lms_engagement">LMS Engagement Report</option>
                <option value="placement_readiness">Placement Readiness Report</option>
                <option value="department_performance">Department Performance Report</option>
                <option value="comprehensive_analytics">Comprehensive College Analytics Report</option>
              </select>
            </div>

            {/* 2. Department */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
              >
                <option value="all">All Departments</option>
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Information Technology">IT</option>
                <option value="Electronics & Communication Engineering">ECE</option>
                <option value="Data Science & Artificial Intelligence">DSAI</option>
                <option value="Mechanical Engineering">MECH</option>
              </select>
            </div>

            {/* 3. Academic Year */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
              >
                <option value="all">All Years</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>

            {/* 4. Risk Level */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Risk Level</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
              >
                <option value="all">All Risk Levels</option>
                <option value="High">High Risk Only</option>
                <option value="Moderate">Moderate Risk Only</option>
                <option value="Low">Low Risk (On Track)</option>
              </select>
            </div>
          </div>

          {/* Date Range & Generate Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-slate-600">Date Range (Optional):</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0B4A2B]"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0B4A2B]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl bg-[#0B4A2B] hover:bg-[#07361F] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Extracting Database Records...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 4. Generated Report Preview Section */}
      {preview && (
        <div className="bg-white rounded-2xl border border-[#DDE7DF] shadow-md p-6 space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-[#1E3E2D]">{preview.report_title}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#0B4A2B]">
                  {preview.category}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                  {preview.total_records} Records
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{preview.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                <span>Generated: <strong className="text-slate-700">{preview.generated_at}</strong></span>
                <span>•</span>
                <span>Scope: <strong className="text-slate-700">{preview.filters.department === 'all' ? 'Entire College' : preview.filters.department}</strong></span>
                <span>•</span>
                <span>Risk: <strong className="text-slate-700">{preview.filters.risk_level}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => handleDownloadCSV()}
                className="px-3.5 py-2 rounded-xl bg-[#0B4A2B] hover:bg-[#07361F] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setPreview(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                title="Close Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Aggregate Metrics in Preview */}
          {preview.summary_metrics && Object.keys(preview.summary_metrics).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#EDF5EE]/60 p-3.5 rounded-xl border border-[#CFE1D4]">
              {Object.entries(preview.summary_metrics).map(([label, val], idx) => (
                <div key={idx} className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-[#52796F] uppercase tracking-wider block">
                    {label}
                  </span>
                  <span className="text-sm font-bold text-[#1E3E2D]">{String(val)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Search within preview table */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search within report records..."
                value={previewSearch}
                onChange={(e) => setPreviewSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B4A2B]/20 focus:border-[#0B4A2B]"
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredRows.length} of {preview.total_records} records
            </span>
          </div>

          {/* Preview Table */}
          {filteredRows.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              No student records matched the applied search criteria.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EDF5EE] text-[#1E3E2D] font-bold border-b border-[#DDE7DF] sticky top-0 z-10">
                  <tr>
                    {preview.columns.map((col, idx) => (
                      <th key={idx} className="py-2.5 px-3 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. Report History Table */}
      <div className="bg-white rounded-2xl border border-[#DDE7DF] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0B4A2B]" />
            <h2 className="text-sm font-bold text-[#1E3E2D]">Recent Report History</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {history.length} archived reports
          </span>
        </div>

        {isLoadingHistory ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-8 h-8 border-4 border-[#0B4A2B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading report logs...
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No reports generated yet. Use the panel above to generate your first audit report.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EDF5EE]/60 text-[#1E3E2D] font-bold border-b border-[#DDE7DF]">
                <tr>
                  <th className="py-3 px-4">Report Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Generated Date</th>
                  <th className="py-3 px-3">Applied Scope</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#1E3E2D]">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-[#0B4A2B] shrink-0" />
                        <div>
                          <div>{item.report_name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            By {item.generated_by}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {item.created_at}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div className="text-[11px]">
                        <span>Dept: <strong className="text-slate-800">{item.department === 'all' ? 'All' : item.department}</strong></span>
                        {item.risk_level !== 'all' && (
                          <span className="ml-2 text-red-600 font-semibold">• {item.risk_level} Risk</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#0B4A2B] font-bold text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setReportType(item.report_type);
                            setDepartment(item.department || 'all');
                            setAcademicYear(item.academic_year || 'all');
                            setRiskLevel(item.risk_level || 'all');
                            handleGenerateReport();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#0B4A2B] hover:bg-[#0B4A2B] hover:text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          title="View / Re-run Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadCSV(
                              item.report_type,
                              item.department,
                              item.academic_year,
                              item.risk_level
                            )
                          }
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                          title="Download CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteHistory(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
