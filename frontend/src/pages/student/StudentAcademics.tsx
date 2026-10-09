import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Award, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const StudentAcademics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getStudentDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { academic, success_score } = data;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-[#10213A] tracking-tight">
          Academic Progress & Results
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed metrics covering CGPA, internal assessment results, and subject status
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="uni-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Cumulative CGPA</span>
          <div className="text-3xl font-black text-blue-900 mt-1">
            {academic.cgpa ? `${academic.cgpa}` : '—'}
            <span className="text-xs text-slate-400 font-normal"> / 10.0</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Institutional target: 6.5+</span>
        </div>

        <div className="uni-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Internal Continuous Evaluation (CIE)
          </span>
          <div className="text-3xl font-black text-blue-900 mt-1">
            {academic.internal_marks ? `${academic.internal_marks}` : '—'}
            <span className="text-xs text-slate-400 font-normal"> / 100</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Benchmark: 60.0/100</span>
        </div>

        <div className="uni-card p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Backlog Status</span>
          <div className="text-3xl font-black text-[#10213A] mt-1">
            {academic.backlog_count}
          </div>
          <span
            className={`text-[11px] font-semibold mt-1 block ${
              academic.backlog_count > 0 ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {academic.backlog_count > 0 ? 'Pending subjects to clear' : 'All subjects cleared'}
          </span>
        </div>
      </div>

      <div className="uni-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#10213A] flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" />
          <span>Academic Success Component Score</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The Academic performance component contributes <strong>30%</strong> towards your total
          Student Success Score. It is computed from your normalized CGPA, continuous internal assessment
          marks, and active backlog status.
        </p>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            Normalized Academic Component Score
          </span>
          <span className="text-lg font-bold text-blue-900">
            {success_score.academic !== null ? `${success_score.academic} / 100` : 'Unassessed'}
          </span>
        </div>
      </div>
    </div>
  );
};
