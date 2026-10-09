import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  Clock,
  ArrowRight,
  Database,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminDataIntegration: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('students');
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);

  // Preview & validation state
  const [previewResult, setPreviewResult] = useState<any | null>(null);
  const [commitResult, setCommitResult] = useState<any | null>(null);
  const [importHistory, setImportHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    try {
      const history = await api.getImportHistory();
      setImportHistory(history || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewResult(null);
      setCommitResult(null);
    }
  };

  const handlePreviewUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setValidating(true);
    setCommitResult(null);
    try {
      const res = await api.previewCSV(file, selectedCategory);
      setPreviewResult(res);
    } catch (err: any) {
      alert(err.message || 'CSV Preview Validation Failed');
    } finally {
      setValidating(false);
    }
  };

  const handleCommit = async () => {
    if (!previewResult || !file) return;

    setCommitting(true);
    try {
      const res = await api.commitCSV({
        category: selectedCategory,
        filename: file.name,
        rows: previewResult.raw_parsed_data || previewResult.preview_rows,
      });
      setCommitResult(res);
      setPreviewResult(null);
      setFile(null);
      loadHistory();
    } catch (err: any) {
      alert(err.message || 'Failed to commit CSV data');
    } finally {
      setCommitting(false);
    }
  };

  const downloadSampleTemplate = async (cat: string) => {
    try {
      const csvText = await fetch(`/api/data-import/template/${cat}`).then((r) => r.text());
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unisphere_template_${cat}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
          Data Integration & Batch CSV Ingestion
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ingest campus records from legacy ERPs, LMS portals, and placement testing platforms
          with schema validation and automatic success recalculation.
        </p>
      </div>

      {/* Upload & Staging Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="uni-card p-6 lg:col-span-2 space-y-5">
          <h3 className="text-sm font-bold text-[#10213A] flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <span>Upload Dataset File</span>
          </h3>

          <form onSubmit={handlePreviewUpload} className="space-y-4">
            {/* Ingestion stream tabs */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Target Data Stream
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 bg-slate-100 p-1 rounded-xl">
                {['students', 'academics', 'attendance', 'lms', 'placement', 'skills'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setPreviewResult(null);
                      setCommitResult(null);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold capitalize transition-all ${
                      selectedCategory === cat
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop File Input */}
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="csvFileInput"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="csvFileInput"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#245BB5] flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-700 hover:underline">
                    Click to select CSV
                  </span>
                  <span className="text-xs text-slate-500"> or drag and drop file here</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Comma Separated Values (.csv) up to 25MB • UTF-8 encoded
                </span>
                {file && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{file.name}</span>
                    <span className="text-slate-400 text-[10px]">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={!file || validating}
              className="w-full py-2.5 bg-[#245BB5] hover:bg-[#102B57] disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {validating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Inspect & Validate Schema</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Download Templates Card */}
        <div className="uni-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#10213A] flex items-center gap-2">
              <Download className="w-4 h-4 text-orange-500" />
              <span>Standard CSV Templates</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Use standardized templates with pre-configured headers matching the UniSphere data
              pipeline.
            </p>

            <div className="mt-4 space-y-2">
              {[
                { cat: 'students', label: 'Student Enrollment Roster' },
                { cat: 'academics', label: 'Academic Grades & CGPA' },
                { cat: 'attendance', label: 'Overall Attendance Percentages' },
                { cat: 'lms', label: 'LMS Assignment Completion & Logins' },
                { cat: 'placement', label: 'Coding & Aptitude Test Scores' },
                { cat: 'skills', label: 'Hackathons & Certifications' },
              ].map((t) => (
                <button
                  key={t.cat}
                  onClick={() => downloadSampleTemplate(t.cat)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors text-left"
                >
                  <span className="truncate">{t.label}</span>
                  <Download className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
            <strong>Data Integrity Rule:</strong> Every uploaded row must include a unique{' '}
            <code>student_id</code> to link across multi-source tables safely.
          </div>
        </div>
      </div>

      {/* Success Commit Banner */}
      {commitResult && (
        <div className="uni-card p-5 bg-emerald-50 border-emerald-200 text-emerald-900 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Batch Ingestion Committed Successfully!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">{commitResult.message}</p>
            <p className="text-[11px] text-emerald-600 mt-1">
              Job ID: #{commitResult.job_id} • All affected Student Success Scores and risk flags
              recalculated automatically.
            </p>
          </div>
        </div>
      )}

      {/* Validation & Staging Preview Table */}
      {previewResult && (
        <div className="uni-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#10213A]">Staged Validation Summary</h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    previewResult.can_commit
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {previewResult.can_commit ? 'Ready to Commit' : 'Validation Errors Found'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Rows: {previewResult.total_rows} • Valid: {previewResult.valid_rows_count} •
                Invalid: {previewResult.invalid_rows_count}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewResult(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                Discard Staged File
              </button>
              <button
                onClick={handleCommit}
                disabled={!previewResult.can_commit || committing}
                className="px-4 py-1.5 rounded-lg bg-[#245BB5] hover:bg-[#102B57] disabled:bg-slate-300 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                {committing ? 'Committing...' : 'Confirm & Commit Ingestion'}
              </button>
            </div>
          </div>

          {/* Validation Errors List if any */}
          {previewResult.validation_errors && previewResult.validation_errors.length > 0 && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
              <span className="font-bold">Errors preventing commit:</span>
              <ul className="list-disc pl-5 space-y-0.5">
                {previewResult.validation_errors.slice(0, 5).map((e: any, idx: number) => (
                  <li key={idx}>
                    Row {e.row_number} ({e.student_id}): {e.errors.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview rows table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200 uppercase tracking-wider">
                <tr>
                  {previewResult.detected_columns.map((col: string, idx: number) => (
                    <th key={idx} className="py-2.5 px-3">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {previewResult.preview_rows.map((row: any, rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-slate-50">
                    {previewResult.detected_columns.map((col: string, cIdx: number) => (
                      <td key={cIdx} className="py-2 px-3 text-slate-700">
                        {row[col] !== undefined && row[col] !== null ? String(row[col]) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import History Table */}
      <div className="uni-card p-5">
        <h3 className="text-sm font-bold text-[#10213A] mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Audit Log of Past Import Jobs</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Job ID</th>
                <th className="py-2.5 px-3">File Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Total Rows</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-3">Updated</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {importHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No import jobs recorded yet.
                  </td>
                </tr>
              ) : (
                importHistory.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold">#{j.id}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{j.filename}</td>
                    <td className="py-2.5 px-3 capitalize text-slate-600">{j.category}</td>
                    <td className="py-2.5 px-3">{j.total_rows}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-bold">+{j.imported_rows}</td>
                    <td className="py-2.5 px-3 text-blue-600 font-bold">{j.updated_rows}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          j.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(j.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
